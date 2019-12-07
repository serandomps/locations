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

var allProvinces = Object.keys(districtsByProvince).sort();

var allDistricts = Object.keys(provincesByDistrict).sort();

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
        url: utils.resolve('accounts:///apis/v/locations' + utils.toData(options)),
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
    return allProvinces;
};

exports.allDistricts = function () {
    return allDistricts;
};

exports.cityByPostal = function (postal) {
    return citiesByPostal[postal];
};

exports.cityByName = function (name) {
    return citiesByName[name];
};

exports.districtsByProvince = function (province) {
    return districtsByProvince[province].sort();
};

exports.citiesByDistrict = function (district) {
    return citiesByDistrict[district].sort();
};

exports.provinceByDistrict = function (district) {
    return provincesByDistrict[district];
};

exports.citiesByProvince = function (province) {
    return citiesByProvince[province].sort();
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

exports.findCountry = function (code) {
    if (code === 'LK') {
        return 'Sri Lanka';
    }
    return code;
};

exports.locateByTags = function (tags) {
    var location = {};
    _.find(tags, function (tag) {
        if (tag.name === 'location:locations:city') {
            location.city = tag.value;
            return;
        }
        if (tag.name === 'location:locations:district') {
            location.district = tag.value;
            return;
        }
        if (tag.name === 'location:locations:province') {
            location.province = tag.value;
            return;
        }
        if (tag.name === 'location:locations:state') {
            location.state = tag.value;
            return;
        }
        if (tag.name === 'location:locations:postal') {
            location.postal = tag.value;
            return;
        }
        if (tag.name === 'location:locations:country') {
            location.country = tag.value;
            return;
        }
    });
    return location;
};
