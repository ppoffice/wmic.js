'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var iconv = require('iconv-lite');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var _require = require('./extract'),
    extract = _require.extract,
    extractContext = _require.extractContext;

var createQuery = require('./Query').createQuery;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 */
function execCommand(command, encoding) {
    return new _promise2.default(function (resolve, reject) {
        exec(command, {
            encoding: 'buffer',
            maxBuffer: 1024 * 1024 * 10
        }, function (error, stdout, stderr) {
            if (error) {
                reject(error);
            } else {
                if (!encoding) {
                    var cp = execSync('chcp').toString().split(':')[1].trim();
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

var defaultOptions = {
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
    encoding: null
};

function wmic(options) {
    var _options = (0, _assign2.default)({}, defaultOptions, options);
    var nodes = Array.isArray(_options.node) ? _options.node.join(',') : _options.node;
    var switches = [_options.namespace ? '/NAMESPACE:' + _options.namespace : null, _options.role ? '/ROLE:' + _options.role : null, nodes ? '/NODE:' + nodes : null, _options.implevel ? '/IMPLEVEL:' + _options.implevel : null, _options.authlevel ? '/AUTHLEVEL:' + _options.authlevel : null, '/LOCALE:MS_409', '/PRIVILEGES:' + (_options.privileges && _options.privileges.toUpperCase() === 'DISABLE' ? 'DISABLE' : 'ENABLE'), '/TRACE:OFF', '/INTERACTIVE:OFF', '/FAILFAST:' + (_options.failfast !== null ? _options.failfast : 'OFF'), _options.user ? '/USER:' + _options.user : null, _options.password ? '/PASSWORD:' + _options.password : null, '/OUTPUT:STDOUT', '/APPEND:STDOUT', '/AGGREGATE:ON'].filter(function (i) {
        return i !== null;
    });
    if (typeof _options.exec !== 'function') {
        _options.exec = function (command) {
            return execCommand(command, _options.encoding).then(extract);
        };
    }

    return {
        alias: function alias(friendlyName) {
            return createQuery.apply(undefined, [_options.exec, _options.binary].concat((0, _toConsumableArray3.default)(switches), [friendlyName]));
        },
        class: function _class(className) {
            return createQuery.apply(undefined, [_options.exec, _options.binary].concat((0, _toConsumableArray3.default)(switches), ['class', className]));
        },
        path: function path(_path) {
            return createQuery.apply(undefined, [_options.exec, _options.binary].concat((0, _toConsumableArray3.default)(switches), ['path', _path]));
        },
        context: function context() {
            var command = [_options.binary].concat((0, _toConsumableArray3.default)(switches), ['context']).join(' ');
            return execCommand(command, _options.encoding).then(extractContext);
        }
    };
}

wmic.Types = require('./Types');
wmic.extract = extract;
wmic.extractContext = extractContext;

module.exports = wmic;