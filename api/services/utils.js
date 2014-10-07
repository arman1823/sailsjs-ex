var utils = {};

utils.ucFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

utils.capitalize = function(string) {
    return string.split(" ").map(function(elem) {
        return utils.ucFirst(elem);
    }).join(" ");
};

module.exports = utils;