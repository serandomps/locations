var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

dust.loadSource(dust.compile(require('./template.html'), 'model-locations-findone'));

var findOne = function (options, done) {
    if (options.location) {
        return done(null, options.location);
    }
    if (!options.id) {
        return done()
    }
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

module.exports = function (ctx, container, options, done) {
    findOne(options, function (err, location) {
        if (err) {
            return done(err);
        }
        if (!location || !location.latitude || !location.longitude) {
            return done(null, function () {
                $('.model-locations-findone', sandbox).remove();
            });
        }
        var sandbox = container.sandbox;
        dust.render('model-locations-findone', serand.pack(location, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var elem = sandbox.append(out);
            var o = {
                zoom: 18,
                center: {
                    lat: location.latitude,
                    lng: location.longitude
                }
            };
            var map = new google.maps.Map($('.map', elem)[0], o);
            new google.maps.Marker({
                map: map,
                position: o.center
            });
            done(null, function () {
                $('.model-locations-findone', sandbox).remove();
            });
        });
    });
};
