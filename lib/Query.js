'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Integer = require('./Types').Integer;

function flatten(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            ret = ret.concat(flatten(array[i]));
        } else {
            ret.push(array[i]);
        }
    }
    return ret;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isBoolean(b) {
    return b === true || b === false;
}

function wrapParameter(s) {
    if (isNumeric(s) || isBoolean(s) || s === null) {
        return s;
    } else if (s instanceof Integer) {
        return s.toString();
    }
    return '"' + s + '"';
}

function keyValueToString(fields) {
    var args = [];
    for (var key in fields) {
        if (fields.hasOwnProperty(key)) {
            args.push(key + '=' + wrapParameter(fields[key]));
        }
    }
    return args.join(', ');
}

var WhereClause = function () {
    function WhereClause() {
        (0, _classCallCheck3.default)(this, WhereClause);

        this.whereArgs = [];
    }

    (0, _createClass3.default)(WhereClause, [{
        key: '__where',
        value: function __where(relation, prop, operator, value) {
            var clause = null;
            if (typeof prop !== 'undefined') {
                if (typeof operator !== 'undefined' && typeof value !== 'undefined') {
                    clause = [prop + ' ' + operator + ' ' + wrapParameter(value)];
                } else if (typeof operator !== 'undefined') {
                    clause = [prop + ' = ' + wrapParameter(operator)];
                } else if (typeof prop === 'string') {
                    clause = [prop];
                } else if (typeof prop === 'function') {
                    var temp = this.whereArgs;
                    this.whereArgs = [];
                    prop.apply(this, [this]);
                    clause = [].concat('(', this.whereArgs, ')');
                    this.whereArgs = temp;
                }
            }
            if (clause && clause.length) {
                if (this.whereArgs.length > 0) {
                    this.whereArgs.push(relation);
                }
                this.whereArgs.push(clause);
            }
        }
    }, {
        key: 'where',
        value: function where(prop, operator, value) {
            this.__where('AND', prop, operator, value);
        }
    }, {
        key: 'orWhere',
        value: function orWhere(prop, operator, value) {
            this.__where('OR', prop, operator, value);
        }
    }, {
        key: 'toString',
        value: function toString() {
            if (this.whereArgs && this.whereArgs.length) {
                return '\'' + flatten(this.whereArgs).join(' ') + '\'';
            }
            return '';
        }
    }, {
        key: 'clone',
        value: function clone() {
            var clause = new WhereClause();
            // Be aware this doesn't clone any complex objects like Date and undefined values.
            clause.whereArgs = JSON.parse((0, _stringify2.default)(this.whereArgs));
            return clause;
        }
    }]);
    return WhereClause;
}();

var CHAINABLE_METHODS = ['find', 'where', 'orWhere'];
var END_POINT_METHODS = ['get', 'list', 'set', 'call', 'create', 'delete'];

var Query = function () {
    function Query(args) {
        (0, _classCallCheck3.default)(this, Query);

        this.args = args;
        this.whereClause = new WhereClause();
        this.nextMethodAllowed = [].concat(CHAINABLE_METHODS).concat(END_POINT_METHODS);
    }

    (0, _createClass3.default)(Query, [{
        key: '__checkIfMethodAllowed',
        value: function __checkIfMethodAllowed(method) {
            if (CHAINABLE_METHODS.indexOf(method) > -1) {
                if (this.nextMethodAllowed.indexOf(method) === -1) {
                    throw new Error('Method \'' + method + '\' not allowed at this position of the chain!');
                }
                var findIndex = this.nextMethodAllowed.indexOf('find');
                if (findIndex > -1) {
                    this.nextMethodAllowed.splice(findIndex, 1);
                }
                if (method === 'find') {
                    var _arr = ['where', 'orWhere'];

                    for (var _i = 0; _i < _arr.length; _i++) {
                        var m = _arr[_i];
                        var index = this.nextMethodAllowed.indexOf(m);
                        if (index > -1) {
                            this.nextMethodAllowed.splice(index, 1);
                        }
                    }
                }
            }
        }
    }, {
        key: 'get',
        value: function get() {
            this.__checkIfMethodAllowed('get');
            if (this.whereClause.toString()) {
                this.args.push('WHERE', this.whereClause.toString());
            }
            this.args.push('GET');

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length) {
                this.args.push(args.join(', '));
            } else {
                this.args.push('*');
            }
            this.args.push('/FORMAT:RAWXML');
        }
    }, {
        key: 'set',
        value: function set(fields) {
            this.__checkIfMethodAllowed('set');
            if (this.whereClause.toString()) {
                this.args.push('WHERE', this.whereClause.toString());
            }
            this.args.push('SET', keyValueToString(fields));
        }
    }, {
        key: 'list',
        value: function list(format) {
            this.__checkIfMethodAllowed('list');
            if (this.whereClause.toString()) {
                this.args.push('WHERE', this.whereClause.toString());
            }
            this.args.push('LIST', format ? format : 'BRIEF');
            this.args.push('/FORMAT:RAWXML');
        }
    }, {
        key: 'find',
        value: function find(key) {
            this.__checkIfMethodAllowed('find');
            this.args.push(key);
        }
    }, {
        key: 'call',
        value: function call(method) {
            this.__checkIfMethodAllowed('call');
            if (this.whereClause.toString()) {
                this.args.push('WHERE', this.whereClause.toString());
            }
            this.args = this.args.concat('CALL', method);

            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            if (args.length) {
                this.args.push(args.map(function (arg) {
                    return Array.isArray(arg) ? '(' + arg.map(wrapParameter).join(', ') + ')' : wrapParameter(arg);
                }));
            }
        }
    }, {
        key: 'create',
        value: function create(fields) {
            this.__checkIfMethodAllowed('create');
            this.args.push('CREATE', keyValueToString(fields));
        }
    }, {
        key: 'delete',
        value: function _delete() {
            this.__checkIfMethodAllowed('delete');
            if (this.whereClause.toString()) {
                this.args.push('WHERE', this.whereClause.toString());
            }
            this.args.push('DELETE');
        }
    }, {
        key: 'where',
        value: function where() {
            var _whereClause;

            this.__checkIfMethodAllowed('where');
            (_whereClause = this.whereClause).where.apply(_whereClause, arguments);
        }
    }, {
        key: 'orWhere',
        value: function orWhere() {
            var _whereClause2;

            this.__checkIfMethodAllowed('orWhere');
            (_whereClause2 = this.whereClause).orWhere.apply(_whereClause2, arguments);
        }
    }, {
        key: 'toString',
        value: function toString() {
            var args = [].concat((0, _toConsumableArray3.default)(this.args));
            // if (this.whereClause.toString()) {
            //     args.push('WHERE', this.whereClause.toString());
            // }
            return args.join(' ');
        }
    }, {
        key: 'clone',
        value: function clone() {
            var query = new Query([].concat((0, _toConsumableArray3.default)(this.args)));
            query.whereClause = this.whereClause.clone();
            query.nextMethodAllowed = [].concat((0, _toConsumableArray3.default)(this.nextMethodAllowed));
            return query;
        }
    }]);
    return Query;
}();

/**
 * Proxy methods and make methods immutable
 */


function proxyMethods(exec, query) {
    var methods = [].concat(END_POINT_METHODS).concat(CHAINABLE_METHODS);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        var _loop = function _loop() {
            var name = _step.value;

            var oldMethod = query[name];
            query[name] = function () {
                var clonedQuery = query.clone();
                proxyMethods(exec, clonedQuery);

                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                oldMethod.apply(clonedQuery, args);
                if (CHAINABLE_METHODS.indexOf(name) > -1) {
                    return clonedQuery;
                } else {
                    return exec(clonedQuery.toString());
                }
            };
        };

        for (var _iterator = (0, _getIterator3.default)(methods), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

module.exports = {
    createQuery: function createQuery(exec) {
        for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
        }

        var query = new Query(args);
        proxyMethods(exec, query);
        return query;
    }
};