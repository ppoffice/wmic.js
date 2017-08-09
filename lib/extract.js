'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseString = require('xml2js').parseString;

function removeQuotes(string) {
    var s = string.trim();
    if (s.startsWith('"') && s.endsWith('\"')) {
        return s.slice(1, s.length - 1);
    }
    return s;
}

function formatValue(string) {
    var s = string.trim();
    if (isNaN(Number(s))) {
        var se = void 0;
        if (se = /^{((.*|\s)*)}$/.exec(s)) {
            return se[1].split(',').map(function (i) {
                return formatValue(removeQuotes(i));
            });
        } else if (s === 'TRUE') {
            return true;
        } else if (s === 'FALSE') {
            return false;
        }
        return removeQuotes(String(s));
    }
    return Number(s);
}

function extractJson(json) {
    if (json.COMMAND.RESULTS) {
        var results = json.COMMAND.RESULTS.map(function (result) {
            return {
                node: result.$.NODE,
                result: function () {
                    if (result.ERROR) {
                        return { error: json.COMMAND.RESULTS[0].ERROR[0].DESCRIPTION[0].trim() };
                    }
                    var instances = result.CIM[0].INSTANCE;
                    return instances.map(function (instance) {
                        var p = {};
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = (0, _getIterator3.default)(instance.PROPERTY), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var prop = _step.value;

                                p[prop.$.NAME] = prop.VALUE ? prop.VALUE[0] : null;
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

                        return p;
                    });
                }()
            };
        });
        if (results.length === 1) {
            return results[0].result;
        }
        return results;
    }
    return [];
}

function extractCallResult(text) {
    var matched = void 0,
        results = [];
    var mRegExp = /(-\s(.*)[\s\S]*?)*?instance of __PARAMETERS\s*\{([\s\S]*?)\s}/g;
    var kvRegExp = /\s*(.*?)\s*=\s*(.*?);/g;

    while (matched = mRegExp.exec(text)) {
        var kv = void 0,
            r = { node: null, result: {} };
        if (matched.length < 4) {
            return text;
        }
        if (matched[2]) {
            r.node = matched[2];
        }
        while ((kv = kvRegExp.exec(matched[3])) && kv.length > 2) {
            r.result[kv[1]] = formatValue(kv[2]);
        }
        results.push(r);
    }
    if (results.length === 0) {
        return null;
    } else if (results.length === 1) {
        return results[0].result;
    }
    return results;
}

function extract(text) {
    return new _promise2.default(function (resolve) {
        parseString(text, function (error, json) {
            return resolve(!error ? extractJson(json) : extractCallResult(text));
        });
    });
}

function extractContext(text) {
    return new _promise2.default(function (resolve) {
        var res = {};
        text.split('\n').forEach(function (kv) {
            var _kv = kv.split(':');
            if (_kv.length > 1) {
                res[_kv[0].trim()] = _kv[1].trim();
            }
        });
        resolve(res);
    });
}

module.exports = {
    extract: extract, extractContext: extractContext
};