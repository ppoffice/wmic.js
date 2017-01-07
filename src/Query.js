const Integer = require('./Types').Integer;

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

function wrapParameter(s) {
    if (isNumeric(s) || isBoolean(s) || s === null) {
        return s;
    } else if (s instanceof Integer) {
        return s.toString();
    }
    return `"${s}"`;
}

function keyValueToString(fields) {
    const args = [];
    for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
            args.push(`${key}=${ wrapParameter(fields[key]) }`);
        }
    }
    return args.join(', ');
}

class WhereClause {
    constructor() {
        this.whereArgs = [];
    }

    __where(relation, prop, operator, value) {
        let clause = null;
        if (typeof(prop) !== 'undefined') {
            if (typeof(operator) !== 'undefined' && typeof(value) !== 'undefined') {
                clause = [`${prop} ${operator} ${ wrapParameter(value) }`];
            } else if (typeof(operator) !== 'undefined') {
                clause = [`${prop} = ${ wrapParameter(operator) }`];
            } else if (typeof(prop) === 'string') {
                clause = [prop];
            } else if (typeof(prop) === 'function') {
                const temp = this.whereArgs;
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

    where(prop, operator, value) {
        this.__where('AND', prop, operator, value);
    }

    orWhere(prop, operator, value) {
        this.__where('OR', prop, operator, value);
    }

    __insertWhereArg() {
        if (this.whereArgs && this.whereArgs.length) {
            this.args.push('WHERE', `'${ flatten(this.whereArgs).join(' ') }'`);
        }
    }
}

const END_POINT_METHODS = ['get', 'list', 'set', 'call', 'create', 'delete'];

class Query extends WhereClause {
    constructor(args) {
        super();
        this.args = args;
        this.nextMethodAllowed = [].concat(END_POINT_METHODS).concat('find', 'where', 'orWhere');
    }

    __checkIfMethodAllowed(method) {
        if (!method.startsWith('__') && this.nextMethodAllowed.indexOf(method) === -1) {
            throw new Error(`Method '${method}' not allowed at this position of the chain!`);
        }
    }

    get(...args) {
        this.args.push('GET');
        if (args.length) {
            this.args.push(args.join(', '));
        } else {
            this.args.push('*');
        }
    }

    set(fields) {
        this.args.push('SET', keyValueToString(fields));
    }

    list(format) {
        this.args.push('LIST', format ? format : 'BRIEF');
    }

    find(key) {
        this.args.push(key);
    }

    call(method, ...args) {
        this.args = this.args.concat('CALL', method)
        if (args.length) {
            this.args.push(
                args.map(arg => Array.isArray(arg) ? '(' + arg.map(wrapParameter).join(', ') + ')' : wrapParameter(arg))
            );
        }
    }

    create(fields) {
        this.args.push('CREATE', keyValueToString(fields));
    }

    delete() {
        this.args.push('DELETE');
    }
}

function prepareNextAllowedMethods(target, method, allowedMethods) {
    if (['find', 'where', 'orWhere'].indexOf(method) > -1) {
        const findIndex = allowedMethods.indexOf('find');
        if (findIndex > -1) {
            allowedMethods.splice(findIndex, 1)
        }
        if (method === 'find') {
            for (let m of ['where', 'orWhere']) {
                const index = allowedMethods.indexOf(m);
                if (index > -1) {
                    allowedMethods.splice(index, 1)
                }
            }
        }
    }
}

module.exports = {
    createQuery(exec, ...args) {
        return new Proxy(new Query(args), {
            get(target, prop, receiver) {
                if (typeof(target[prop]) === 'function') {
                    target.__checkIfMethodAllowed(prop);
                    prepareNextAllowedMethods(target, prop, target.nextMethodAllowed);
                    return function (...methodArgs) {
                        if (END_POINT_METHODS.indexOf(prop) > -1) {
                            if (prop !== 'create') {
                                target.__insertWhereArg();
                            }
                            target[prop].call(receiver, ...methodArgs);
                            target.args.push(['get', 'list'].indexOf(prop) > -1 ? '/FORMAT:RAWXML' : '/NOINTERACTIVE');
                            return exec(target.args.join(' '));
                        }
                        target[prop].call(receiver, ...methodArgs);
                        return receiver;
                    }
                }
                return target[prop];
            }
        });
    }
};