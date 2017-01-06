'use strict';

var exec = require('child_process').exec;

var extract = require('./extract');
var createQuery = require('./Query').createQuery;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 * @param command
 * @returns {Promise}
 */
function execCommand(command) {
    return new Promise(function (resolve, reject) {
        exec(command, { maxBuffer: 1024 * 1024 * 10 }, function (error, stdout, stderr) {
            if (error) {
                reject(error);
            } else if (stderr.trim()) {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}

function wmic(options) {
    var _options = Object.assign({}, {
        binary: 'wmic',
        exec: function exec(command) {
            return execCommand(command).then(extract);
        }
    }, options);

    return {
        alias: function alias(friendlyName) {
            return createQuery(_options, _options.binary, friendlyName);
        },
        class: function _class(className) {
            return createQuery(_options, _options.binary, 'class', className);
        },
        path: function path(_path) {
            return createQuery(_options, _options.binary, 'path', _path);
        }
    };
}

module.exports = wmic;