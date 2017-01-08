const parseString = require('xml2js').parseString;

function removeQuotes(string) {
    let s = string.trim();
    if (s.startsWith('"') && s.endsWith('\"')) {
        return s.slice(1, s.length - 1);
    }
    return s;
}

function formatValue(string) {
    let s = string.trim();
    if (isNaN(parseInt(s))) {
        let se;
        if (se = /^{((.*|\s)*)}$/.exec(s)) {
            return se[1].split(',').map(i => formatValue(removeQuotes(i)));
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
        const results = json.COMMAND.RESULTS.map(result => {
            return {
                node: result.$.NODE,
                result: (function () {
                    if (result.ERROR) {
                        return { error: json.COMMAND.RESULTS[0].ERROR[0].DESCRIPTION[0].trim() };
                    }
                    const instances = result.CIM[0].INSTANCE;
                    return instances.map(instance => {
                        const p = {};
                        for (let prop of instance.PROPERTY) {
                            p[prop.$.NAME] = prop.VALUE ? prop.VALUE[0] : null;
                        }
                        return p;
                    });
                })()
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
    let matched, results = [];
    const mRegExp = /(-\s(.*)[\s\S]*?)*?instance of __PARAMETERS\s*\{([\s\S]*?)\s}/g;
    const kvRegExp = /\s*(.*?)\s*=\s*(.*?);/g;

    while (matched = mRegExp.exec(text)) {
        let kv, r = { node: null, result: {} };
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
    return new Promise((resolve) => {
        parseString(text, (error, json) => {
            return resolve(!error ? extractJson(json) : extractCallResult(text));
        });
    })
}

function extractContext(text) {
    return new Promise((resolve) => {
        const res = {};
        text.split('\n').forEach(kv => {
            const _kv = kv.split(':');
            if (_kv.length > 1) {
                res[_kv[0].trim()] = _kv[1].trim();
            }
        });
        resolve(res);
    });
}

module.exports = {
    extract, extractContext
};