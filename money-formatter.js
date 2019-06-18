
'use strict';

exports.format = function (value) {
    if (isNaN(value)) { return '0.00'; }
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

exports.locale = function(value){
    return value.toLocaleString();
}