var utils = require('utils');

var cities = utils.json(require('./cities.json'));

var provinces = utils.json(require('./provinces'));

var cityByPostal = _.keyBy(cities, 'postal');

var cityByName = {};

cities.forEach(function (city) {
    cityByName[city.name] = city;
    var aliases = city.aliases || [];
    aliases.forEach(function (alias) {
        cityByName[alias] = city;
    });
});

var provincesByName = _.keyBy(provinces, 'name');

exports.findOne = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations/' + options.id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.find = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations' + utils.data(options)),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.remove = function (options, done) {
    $.ajax({
        method: 'DELETE',
        url: utils.resolve('accounts:///apis/v/locations/' + options.id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.create = function (options, done) {
    $.ajax({
        url: utils.resolve('accounts:///apis/v/locations' + (options.id ? '/' + options.id : '')),
        type: options.id ? 'PUT' : 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(options),
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.allCities = function () {
    return cities;
};

exports.allProvinces = function () {
    return provinces;
};

exports.allDistricts = function (province) {
    province = provincesByName[province];
    return province.districts;
};

exports.cityByPostal = function (postal) {
    return cityByPostal[postal];
};

exports.cityByName = function (name) {
    return cityByName[name];
};

exports.findCity = function (name, postal) {
    var city = exports.cityByName(name);
    if (city) {
        return city;
    }
    city = exports.cityByPostal(postal);
    if (city) {
        return city;
    }
    return null;
};
