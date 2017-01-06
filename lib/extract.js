'use strict';

var parseString = require('xml2js').parseString;

function formatJson(json) {
    try {
        if (json.COMMAND.RESULTS[0].ERROR) {
            return { error: json.COMMAND.RESULTS[0].ERROR[0].DESCRIPTION[0].trim() };
        }
        var instances = json.COMMAND.RESULTS[0].CIM[0].INSTANCE;
        return instances.map(function (instance) {
            var p = {};
            instance.PROPERTY.forEach(function (prop) {
                p[prop.$.NAME] = prop.VALUE ? prop.VALUE[0] : null;
            });
            return p;
        });
    } catch (e) {
        console.error(e);
    }
}

function removeQuotes(string) {
    var s = string.trim();
    if (s.startsWith('"') && s.endsWith('\"')) {
        return s.slice(1, s.length - 1);
    }
    return s;
}

function formatValue(string) {
    var s = string.trim();
    if (isNaN(parseInt(s))) {
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

function extract(text) {
    var insRegExp = /instance of __PARAMETERS\s*\{\s*(.*\s*)*}/g;
    var kvRegExp = /\s*(.*?)\s*=\s*(.*?);/g;

    return new Promise(function (resolve) {
        parseString(text, function (error, result) {
            if (!error) {
                return resolve(formatJson(result));
            } else {
                var insText = void 0;
                if ((insText = insRegExp.exec(text)) !== null) {
                    var kv = void 0,
                        _result = {};
                    while ((kv = kvRegExp.exec(insText[0])) && kv.length > 2) {
                        _result[kv[1]] = formatValue(kv[2]);
                    }
                    return resolve(_result);
                } else {
                    resolve(text);
                }
            }
        });
    });
}

module.exports = extract;