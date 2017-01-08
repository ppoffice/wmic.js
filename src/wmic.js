const iconv = require('iconv-lite');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const { extract, extractContext } = require('./extract');
const createQuery = require('./Query').createQuery;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 */
function execCommand(command, encoding) {
    return new Promise((resolve, reject) => {
        exec(command, {
            encoding: 'buffer',
            maxBuffer: 1024 * 1024 * 10,
        }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                if (!encoding) {
                    const cp = execSync('chcp').toString().split(':')[1].trim();
                    encoding = 'cp' + cp;
                }
                if (stderr.toString().trim()) {
                    reject(new Error(iconv.decode(stderr, encoding)));
                } else {
                    resolve(iconv.decode(stdout, encoding));
                }
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
    encoding: null,
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
    if (typeof(_options.exec) !== 'function') {
        _options.exec = (command) => execCommand(command, _options.encoding).then(extract)
    }

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
            return execCommand(command, _options.encoding).then(extractContext);
        }
    }
}

wmic.Types = require('./Types');
wmic.extract = extract;
wmic.extractContext = extractContext;

module.exports = wmic;
