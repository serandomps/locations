var serand = require('serand');
var utils = require('utils');
var form = require('form');
var dust = require('dust')();
var create = require('../create');
var locate = require('../locate');

dust.loadSource(dust.compile(require('./template.html'), 'model-locations-picker'));

var configs = function (options) {
    return {
        location: {
            find: function (context, source, done) {
                serand.blocks('select', 'find', source, done);
            },
            validate: function (context, data, value, done) {
                if (options.required && !value) {
                    return done(null, 'Please select an existing location or create one.');
                }
                done(null, null, value);
            },
            update: function (context, source, error, value, done) {
                done();
            },
            render: function (ctx, pickerForm, data, value, done) {
                var picker = $('.picker .location', pickerForm.elem);
                var creator = $('.creator', pickerForm.elem);
                serand.blocks('select', 'create', picker, {
                    value: value,
                    change: function () {
                        pickerForm.find(function (err, pick) {
                            if (err) {
                                return console.error(err);
                            }
                            pickerForm.validate(pick, function (err, errors, location) {
                                if (err) {
                                    return console.error(err);
                                }
                                pickerForm.update(errors, location, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    var val = pick.location;
                                    if (val === '+') {
                                        return creator.removeClass('hidden');
                                    }
                                    creator.addClass('hidden');
                                });
                            });
                        });
                    }
                }, done);
            }
        },
    };
};

var findLocations = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations' + utils.toData({query: {user: options.user}})),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};


module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    options = options || {};
    findLocations({user: options.user || ctx.token && ctx.token.user.id}, function (err, locations) {
        if (err) {
            return done(err);
        }
        var picks = [
            {value: '', label: 'Location'}
        ];
        if (options.creatable) {
            picks.push({value: '+', label: 'Add Location'});
        }
        picks = picks.concat(_.map(locations, function (location) {
            return {
                value: location.id,
                label: locate.serialize(location)
            }
        }));
        var expand = options.expand && !locations.length;
        dust.render('model-locations-picker', serand.pack({
            _: {
                label: options.label,
                picks: picks,
                expand: expand,
                details: options.details
            }
        }, container, 'model-locations'), function (err, out) {
            if (err) {
                return done(err);
            }

            var elem = sandbox.append(out);
            var pickerForm = form.create(container.id, elem, configs(options));
            pickerForm.render(ctx, {
                location: options.location || (expand && '+')
            }, function (err) {
                if (err) {
                    return done(err);
                }
                create(ctx, {
                    id: container.id,
                    sandbox: $('.creator', elem),
                    parent: elem
                }, null, function (err, o) {
                    if (err) {
                        return done(err)
                    }
                    var eventer = utils.eventer();
                    var creatorForm = o.form;
                    eventer.find = function (done) {
                        pickerForm.find(function (err, o) {
                            if (err) {
                                return done(err);
                            }
                            if (o.location !== '+') {
                                return done(err, o.location);
                            }
                            creatorForm.find(function (err, data) {
                                if (err) {
                                    return done(err);
                                }
                                done(null, data);
                            });
                        });
                    };
                    eventer.validate = function (loc, done) {
                        pickerForm.find(function (err, o) {
                            if (err) {
                                return done(err);
                            }
                            if (o.location !== '+') {
                                pickerForm.validate({
                                    location: loc
                                }, function (err, errors) {
                                    if (err) {
                                        return done(err);
                                    }
                                    if (errors) {
                                        return done(null, errors);
                                    }
                                    done(null, null, loc);
                                });
                                return;
                            }
                            creatorForm.validate(loc, function (err, errors, data) {
                                if (err) {
                                    return done(err);
                                }
                                if (errors) {
                                    return done(null, errors);
                                }
                                done(null, null, data);
                            });
                        });
                    };
                    eventer.update = function (errors, location, done) {
                        pickerForm.find(function (err, o) {
                            if (err) {
                                return done(err);
                            }
                            if (o.location !== '+') {
                                return pickerForm.update(errors, location, done);
                            }
                            creatorForm.update(errors, location, done);
                        });
                    };
                    eventer.create = function (location, done) {
                        console.log('creating location')
                        console.log(location)
                        if (typeof location === 'string' || location instanceof String) {
                            return done(null, null, location);
                        }
                        o.create(function (err, errors, location) {
                            if (err) {
                                return done(err);
                            }
                            if (errors) {
                                return done(null, errors);
                            }
                            done(null, null, location.id, location);
                        });
                    };
                    done(null, eventer);
                });
            });
        });
    });
};
