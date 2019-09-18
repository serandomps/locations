var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

dust.loadSource(dust.compile(require('./template.html'), 'locations-find'));

var index = function (done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations'),
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
    index(function (err, data) {
        if (err) {
            return done(err);
        }
        var sandbox = container.sandbox;
        dust.render('locations-find', serand.pack({
            title: options.title,
            size: 6,
            locations: data
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, function () {
                $('.locations-find', sandbox).remove();
            });
        });
    });
};
