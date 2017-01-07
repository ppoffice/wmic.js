'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        _classCallCheck(this, WhereClause);

        this.whereArgs = [];
    }

    _createClass(WhereClause, [{
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
        key: '__insertWhereArg',
        value: function __insertWhereArg() {
            if (this.whereArgs && this.whereArgs.length) {
                this.args.push('WHERE', '\'' + flatten(this.whereArgs).join(' ') + '\'');
            }
        }
    }]);

    return WhereClause;
}();

var END_POINT_METHODS = ['get', 'list', 'set', 'call', 'create', 'delete'];

var Query = function (_WhereClause) {
    _inherits(Query, _WhereClause);

    function Query(args) {
        _classCallCheck(this, Query);

        var _this = _possibleConstructorReturn(this, (Query.__proto__ || Object.getPrototypeOf(Query)).call(this));

        _this.args = args;
        _this.nextMethodAllowed = [].concat(END_POINT_METHODS).concat('find', 'where', 'orWhere');
        return _this;
    }

    _createClass(Query, [{
        key: '__checkIfMethodAllowed',
        value: function __checkIfMethodAllowed(method) {
            if (!method.startsWith('__') && this.nextMethodAllowed.indexOf(method) === -1) {
                throw new Error('Method \'' + method + '\' not allowed at this position of the chain!');
            }
        }
    }, {
        key: 'get',
        value: function get() {
            this.args.push('GET');

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length) {
                this.args.push(args.join(', '));
            } else {
                this.args.push('*');
            }
        }
    }, {
        key: 'set',
        value: function set(fields) {
            this.args.push('SET', keyValueToString(fields));
        }
    }, {
        key: 'list',
        value: function list(format) {
            this.args.push('LIST', format ? format : 'BRIEF');
        }
    }, {
        key: 'find',
        value: function find(key) {
            this.args.push(key);
        }
    }, {
        key: 'call',
        value: function call(method) {
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
            this.args.push('CREATE', keyValueToString(fields));
        }
    }, {
        key: 'delete',
        value: function _delete() {
            this.args.push('DELETE');
        }
    }]);

    return Query;
}(WhereClause);

function prepareNextAllowedMethods(target, method, allowedMethods) {
    if (['find', 'where', 'orWhere'].indexOf(method) > -1) {
        var findIndex = allowedMethods.indexOf('find');
        if (findIndex > -1) {
            allowedMethods.splice(findIndex, 1);
        }
        if (method === 'find') {
            var _arr = ['where', 'orWhere'];

            for (var _i = 0; _i < _arr.length; _i++) {
                var m = _arr[_i];
                var index = allowedMethods.indexOf(m);
                if (index > -1) {
                    allowedMethods.splice(index, 1);
                }
            }
        }
    }
}

module.exports = {
    createQuery: function createQuery(exec) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
        }

        return new Proxy(new Query(args), {
            get: function get(target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    target.__checkIfMethodAllowed(prop);
                    prepareNextAllowedMethods(target, prop, target.nextMethodAllowed);
                    return function () {
                        var _target$prop2;

                        for (var _len4 = arguments.length, methodArgs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                            methodArgs[_key4] = arguments[_key4];
                        }

                        if (END_POINT_METHODS.indexOf(prop) > -1) {
                            var _target$prop;

                            if (prop !== 'create') {
                                target.__insertWhereArg();
                            }
                            (_target$prop = target[prop]).call.apply(_target$prop, [receiver].concat(methodArgs));
                            target.args.push(['get', 'list'].indexOf(prop) > -1 ? '/FORMAT:RAWXML' : '/NOINTERACTIVE');
                            return exec(target.args.join(' '));
                        }
                        (_target$prop2 = target[prop]).call.apply(_target$prop2, [receiver].concat(methodArgs));
                        return receiver;
                    };
                }
                return target[prop];
            }
        });
    }
};