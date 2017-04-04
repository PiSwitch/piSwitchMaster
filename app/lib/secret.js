var jsonfile = require('jsonfile');
var crypto = require('crypto');
const SECRETS_FILE_PATH = __dirname  + '/../../secrets.json';

var exports = {};
var secrets = null;

function load() {
    secrets = jsonfile.readFileSync(SECRETS_FILE_PATH);
}

function save() {
    jsonfile.writeFileSync(SECRETS_FILE_PATH, secrets);
}

function ensureInit() {
    if(!secrets) {
        load();
    }
}

function createSecret(secretKey) {
    secrets[secretKey] = crypto.randomBytes(256);
    save();
}

exports.get = function (secretKey) {
    ensureInit();
    if(!secrets[secretKey]) {
        createSecret(secretKey);
    }
    if(!(secrets[secretKey] instanceof Buffer) || typeof secrets[secretKey].write !== 'function') {
        secrets[secretKey] = new Buffer(secrets[secretKey]);
    }

    return secrets[secretKey];
};

module.exports = exports;
