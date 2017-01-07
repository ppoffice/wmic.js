const exec = require('child_process').exec;

const { extract, extractContext } = require('./extract');
const createQuery = require('./Query').createQuery;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 * @param command
 * @returns {Promise}
 */
function execCommand(command) {
    // console.log(command)
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

const defaultOptions = {
    // Global switches
    role: null,
    node: null,
    user: null,
    password: null,
    failfast: null,
    implevel: null,
    authlevel: null,
    namespace: null,
    privileges: null,

    binary: 'wmic',
    exec: command => execCommand(command).then(extract),
};

function wmic(options) {
    const _options = Object.assign({}, defaultOptions, options);
    const nodes = Array.isArray(_options.node) ? _options.node.join(',') : _options.node;
    const switches = [
        _options.namespace ? '/NAMESPACE:' + _options.namespace : null,
        _options.role ? '/ROLE:' + _options.role : null,
        nodes ? '/NODE:' + nodes : null,
        _options.implevel ? '/IMPLEVEL:' + _options.implevel : null,
        _options.authlevel ? '/AUTHLEVEL:' + _options.authlevel : null,
        '/LOCALE:MS_409',
        '/PRIVILEGES:' + (_options.privileges && _options.privileges.toUpperCase() === 'DISABLE' ? 'DISABLE' : 'ENABLE'),
        '/TRACE:OFF',
        '/INTERACTIVE:OFF',
        '/FAILFAST:' + (_options.failfast !== null ? _options.failfast : 'OFF'),
        _options.user ? '/USER:' + _options.user : null,
        _options.password ? '/PASSWORD:' + _options.password : null,
        '/OUTPUT:STDOUT',
        '/APPEND:STDOUT',
        '/AGGREGATE:ON'
    ].filter(i => i !== null);

    return {
        alias(friendlyName) {
            return createQuery(_options.exec, _options.binary, ...switches, friendlyName);
        },

        class(className) {
            return createQuery(_options.exec, _options.binary, ...switches, 'class', className);
        },

        path(path) {
            return createQuery(_options.exec, _options.binary, ...switches, 'path', path);
        },

        context() {
            const command = [_options.binary, ...switches, 'context'].join(' ');
            return execCommand(command).then(extractContext);
        }
    }
}

wmic.Types = require('./Types');

module.exports = wmic;
