exports.serialize = function (location) {
    var address = '';
    address += location.name ? location.name + ', ' : '';
    if (location.name !== location.line1) {
        address += location.line1 ? location.line1 + ', ' : '';
    }
    if (location.name !== location.line2 && location.line1 !== location.line2) {
        address += location.line2 ? location.line2 + ', ' : '';
    }
    address += location.city ? location.city + ', ' : '';
    if (location.city !== location.district) {
        address += location.district ? location.district + ', ' : '';
    }
    address += location.provice ? location.province + ', ' : '';
    address += location.state ? location.state + ', ' : '';
    address += location.postal ? location.postal + ', ' : '';
    address += location.country ? location.country : '';
    return address;
};
