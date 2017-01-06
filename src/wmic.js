// const iconv = require('iconv-lite');
const exec = require('child_process').exec;
const parseString = require('xml2js').parseString;

/**
 * For more details about error codes, please see <a href="https://msdn.microsoft.com/en-us/library/aa394559(v=vs.85).aspx">WMI Error Constants</a>
 * @param command
 * @returns {Promise}
 */
function collectOutput(command) {
    return new Promise((resolve, reject) => {
        exec(command, [], (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}

function flatten(array) {
    let ret = [];
    for(let i = 0; i < array.length; i++) {
        if(Array.isArray(array[i])) {
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

function wrapQuotes(s) {
    return isNumeric(s) || isBoolean(s) || s === null ? s : `"${s}"`;
}

function keyValueToString(fields) {
    const args = [];
    for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
            args.push(`${key}=${ wrapQuotes(fields[key]) }`);
        }
    }
    return args.join(', ');
}

function formatJson(json) {
    try {
        // console.log(JSON.stringify(json, null, '    '))
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

function execWmic(wmicObject, xmlFormat = true) {
    const args = [].concat(wmicObject.args);
    if (xmlFormat) {
        args.push('/format:rawxml');
    }
    // console.log(['wmic'].concat(args).join(' '))
    // console.log(args)
    return collectOutput([wmicObject.exec].concat(args).join(' ')).then(text => {
        return new Promise((resolve, reject) => {
            if (xmlFormat) {
                parseString(text, (error, result) => {
                    if (!error) {
                        return resolve(formatJson(result));
                    }
                    return reject(error);
                });
            } else {
                resolve(text);
            }
        })
    });
}

class WmicObject {
    constructor(args) {
        this.exec = 'wmic';
        this.args = args ? Array.from(args) : [];
    }

    get(...args) {
        this.args.push('get');
        if (args.length) {
            this.args.push(args.join(', '));
        } else {
            this.args.push('*');
        }
        return execWmic(this);
    }

    set(fields) {
        this.args.push('set', keyValueToString(fields));
        this.args.push('/nointeractive');
        return execWmic(this, false);
    }

    list(format) {
        this.args.push('list', format ? format : 'brief');
        return execWmic(this);
    }

    call(method, ...args) {
        this.args.push('call', method);
        if (args.length) {
            this.args = this.args.concat(args.map(arg => Array.isArray(arg) ? '(' + arg.map(wrapQuotes).join(', ') + ')' : wrapQuotes(arg)))
        }
        // this.args.push('/nointeractive');
        return execWmic(this, false);
    }

    delete() {
        this.args.push('delete');
        this.args.push('/nointeractive');
        return execWmic(this, false);
    }
}

class WmicClass extends WmicObject {
    constructor(wmicOptions, type, name) {
        super();
        this.wmicOptions = wmicOptions;
        this.args.push(type);
        if (typeof(name) !== 'undefined') {
            this.args.push(name);
        }
        this.__whereClause__ = [];
    }

    __where__(relation, prop, operator, value) {
        let clause = null;
        if (typeof(prop) !== 'undefined') {
            if (typeof(operator) !== 'undefined' && typeof(value) !== 'undefined') {
                clause = [`${prop} ${operator} ${ wrapQuotes(value) }`];
            } else if (typeof(operator) !== 'undefined') {
                clause = [`${prop} = ${ wrapQuotes(operator) }`];
            } else if (typeof(prop) === 'string') {
                clause = [prop];
            } else if (typeof(prop) === 'function') {
                const temp = this.__whereClause__;
                this.__whereClause__ = [];
                prop.apply(this);
                clause = [].concat('(', this.__whereClause__, ')');
                this.__whereClause__ = temp;
            }
        }
        if (clause && clause.length) {
            if (this.__whereClause__.length > 0) {
                this.__whereClause__.push(relation);
            }
            this.__whereClause__.push(clause);
        }
    }

    where(prop, operator, value) {
        this.__where__.call(this, 'AND', prop, operator, value);
        return this;
    }

    orWhere(prop, operator, value) {
        this.__where__.call(this, 'AND', prop, operator, value);
        return this;
    }

    __insertWhereArg() {
        if (this.__whereClause__ && this.__whereClause__.length) {
            this.args.push('where', `'${ flatten(this.__whereClause__).join(' ') }'`);
        }
    }

    get(...args) {
        this.__insertWhereArg();
        return super.get.apply(this, args);
    }

    set(...args) {
        this.__insertWhereArg();
        return super.set.apply(this, args);
    }

    find(key) {
        const args = [].concat(this.args, key);
        return new WmicObject(args);
    }

    list(...args) {
        this.__insertWhereArg();
        return super.list.apply(this, args);
    }

    call(...args) {
        this.__insertWhereArg();
        return super.call.apply(this, args);
    }

    create(fields) {
        this.args.push('create', keyValueToString(fields));
        this.args.push('/nointeractive');
        return execWmic(this, false);
    }

    delete(...args) {
        this.__insertWhereArg();
        return super.delete.apply(this, args);
    }
}

function wmic(options) {

    return {
        alias(friendlyName) {
            return new WmicClass(options, this, friendlyName);
        },

        class(className) {
            return new WmicClass(options, 'class', className);
        },

        path(path) {
            return new WmicClass(options, 'path', path);
        }
    }
}

module.exports = wmic;
