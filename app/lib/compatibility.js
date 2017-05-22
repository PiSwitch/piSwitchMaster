var packageJson = require('../../package.json');

var exports = {};
module.exports = exports;

var minVersion = '0.0.0';
var maxVersion = packageJson.version;

exports.getSupportedVersions = function () {
    return {
        minVersion: minVersion,
        maxVersion: maxVersion
    };
};

exports.getPortalVersion = function () {
    return packageJson.version;
};

exports.isCompatible = function(version) {
    return exports.compareVersion(minVersion, version) <= 0 && exports.compareVersion(maxVersion, version) >= 0;
};

exports.splitVersion = function(version) {
    version = version.split('.');
    return {
        major: version[0],
        minor: version[1],
        build: version[2]
    };
};

exports.compareVersion = function(version1, version2) {
    if(typeof version1 === 'string') {
        version1 = exports.splitVersion(version1);
    }
    if(typeof version2 === 'string') {
        version2 = exports.splitVersion(version2);
    }

    var majorDiff = version1.major - version2.major;
    if(majorDiff != 0) {
        return majorDiff;
    }

    var minorDiff = version1.minor - version2.minor;
    if(minorDiff != 0) {
        return minorDiff;
    }

    return version1.build - version2.build;
};