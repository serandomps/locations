var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Location = require('../service');

dust.loadSource(dust.compile(require('./template'), 'locations-remove'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Location.findOne({id: options.id}, function (err, contact) {
        if (err) return done(err);
        dust.render('locations-remove', serand.pack(contact, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = sandbox.append(out);
            $('.remove', el).on('click', function () {
                Location.remove(contact, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    serand.redirect('/locations');
                });
            });
            done(null, function () {
                $('.locations-remove', sandbox).remove();
            });
        });
    });
};
