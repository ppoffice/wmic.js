// const iconv = require('iconv-lite');
const exec = require('child_process').exec;

const extract = require('./extract');
const createQuery = require('./Query').createQuery;
const UnwrappedParameter = require('./Query').UnwrappedParameter;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 * @param command
 * @returns {Promise}
 */
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, {maxBuffer: 1024 * 1024 * 10}, (error, stdout, stderr) => {
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
    const _options = Object.assign({}, {
        binary: 'wmic',
        exec: command => execCommand(command).then(extract)
    }, options);

    return {
        alias(friendlyName) {
            return createQuery(_options, _options.binary, friendlyName);
        },

        class(className) {
            return createQuery(_options, _options.binary, 'class', className);
        },

        path(path) {
            return createQuery(_options, _options.binary, 'path', path);
        }
    }
}

wmic.unwrap = s => new UnwrappedParameter(s);

module.exports = wmic;
