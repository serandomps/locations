var utils = require('utils');

var cities = utils.json(require('./cities.json'));

var citiesByDistrict = {};

var citiesByProvince = {};

var districtsByProvince = {};

var provincesByDistrict = {};

var citiesByName = {};

var citiesByPostal = {};

cities.forEach(function (city) {

    citiesByName[city.name] = city;
    citiesByPostal[city.postal] = city;

    var cityByDistrict = citiesByDistrict[city.district] || (citiesByDistrict[city.district] = []);
    cityByDistrict.push(city);

    var cityByProvince = citiesByProvince[city.province] || (citiesByProvince[city.province] = []);
    cityByProvince.push(city);

    var districtByProvince = districtsByProvince[city.province] || (districtsByProvince[city.province] = []);
    if (districtByProvince.indexOf(city.district) === -1) {
        districtByProvince.push(city.district);
    }

    provincesByDistrict[city.district] = city.province;

    var aliases = city.aliases;
    if (!aliases) {
        return;
    }
    aliases.forEach(function (alias) {
        citiesByName[alias] = city;
        citiesByPostal[alias] = city;
    });
});

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
    return Object.keys(districtsByProvince);
};

exports.allDistricts = function () {
    return Object.keys(provincesByDistrict);
};

exports.cityByPostal = function (postal) {
    return citiesByPostal[postal];
};

exports.cityByName = function (name) {
    return citiesByName[name];
};

exports.districtsByProvince = function (province) {
    return districtsByProvince[province] || [];
};

exports.citiesByDistrict = function (district) {
    return citiesByDistrict[district];
};

exports.provinceByDistrict = function (district) {
    return provincesByDistrict[district];
};

exports.citiesByProvince = function (province) {
    return citiesByProvince[province];
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
