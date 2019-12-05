var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

dust.loadSource(dust.compile(require('./template.html'), 'model-locations-findone'));

var findOne = function (id, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations/' + id),
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
    findOne(options.id, function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        dust.render('model-locations-findone', serand.pack(data, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var elem = sandbox.append(out);
            var o = {
                zoom: 18,
                center: {
                    lat: data.latitude,
                    lng: data.longitude
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
