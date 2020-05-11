var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Locations = require('../service');

dust.loadSource(dust.compile(require('./template.html'), 'model-locations-find'));

module.exports = function (ctx, container, options, done) {
    Locations.find({
        query: {
            user: ctx.token && ctx.token.user.id
        }
    }, function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        data.forEach(function (location) {
            location.country = Locations.findCountry(location.country)
        });
        dust.render('model-locations-find', serand.pack({
            title: options.title,
            size: 6,
            locations: data
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, function () {
                $('.model-locations-find', sandbox).remove();
            });
        });
    });
};
