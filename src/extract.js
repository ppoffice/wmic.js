const parseString = require('xml2js').parseString;


function formatJson(json) {
    try {
        if (json.COMMAND.RESULTS[0].ERROR) {
            return { error: json.COMMAND.RESULTS[0].ERROR[0].DESCRIPTION[0].trim() };
        }
        const instances = json.COMMAND.RESULTS[0].CIM[0].INSTANCE;
        return instances.map(instance => {
            const p = {};
            instance.PROPERTY.forEach(prop => {
                p[prop.$.NAME] = prop.VALUE ? prop.VALUE[0] : null;
            });
            return p;
        });
    } catch(e) {
        console.error(e);
    }
}

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

function extract(text) {
    const insRegExp = /instance of __PARAMETERS\s*\{\s*(.*\s*)*}/g;
    const kvRegExp = /\s*(.*?)\s*=\s*(.*?);/g;

    return new Promise((resolve) => {
        parseString(text, (error, result) => {
            if (!error) {
                return resolve(formatJson(result));
            } else {
                let insText;
                if ((insText = insRegExp.exec(text)) !== null) {
                    let kv, result = {};
                    while ((kv = kvRegExp.exec(insText[0])) && kv.length > 2) {
                        result[kv[1]] = formatValue(kv[2]);
                    }
                    return resolve(result);
                } else {
                    resolve(text);
                }
            }
        });
    })
}

module.exports = extract;