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

    toString() {
        if (this.whereArgs && this.whereArgs.length) {
            return `'${ flatten(this.whereArgs).join(' ') }'`;
        }
        return '';
    }

    clone() {
        const clause = new WhereClause();
        // Be aware this doesn't clone any complex objects like Date and undefined values.
        clause.whereArgs = JSON.parse(JSON.stringify(this.whereArgs));
        return clause;
    }
}

const CHAINABLE_METHODS = ['find', 'where', 'orWhere'];
const END_POINT_METHODS = ['get', 'list', 'set', 'call', 'create', 'delete'];

class Query {
    constructor(args) {
        this.args = args;
        this.whereClause = new WhereClause();
        this.nextMethodAllowed = [].concat(CHAINABLE_METHODS).concat(END_POINT_METHODS);
    }

    __checkIfMethodAllowed(method) {
        if (CHAINABLE_METHODS.indexOf(method) > -1) {
            if (this.nextMethodAllowed.indexOf(method) === -1) {
                throw new Error(`Method '${method}' not allowed at this position of the chain!`);
            }
            const findIndex = this.nextMethodAllowed.indexOf('find');
            if (findIndex > -1) {
                this.nextMethodAllowed.splice(findIndex, 1)
            }
            if (method === 'find') {
                for (let m of ['where', 'orWhere']) {
                    const index = this.nextMethodAllowed.indexOf(m);
                    if (index > -1) {
                        this.nextMethodAllowed.splice(index, 1)
                    }
                }
            }
        }
    }

    get(...args) {
        this.__checkIfMethodAllowed('get');
        if (this.whereClause.toString()) {
            this.args.push('WHERE', this.whereClause.toString());
        }
        this.args.push('GET');
        if (args.length) {
            this.args.push(args.join(', '));
        } else {
            this.args.push('*');
        }
        this.args.push('/FORMAT:RAWXML');
    }

    set(fields) {
        this.__checkIfMethodAllowed('set');
        if (this.whereClause.toString()) {
            this.args.push('WHERE', this.whereClause.toString());
        }
        this.args.push('SET', keyValueToString(fields));
    }

    list(format) {
        this.__checkIfMethodAllowed('list');
        if (this.whereClause.toString()) {
            this.args.push('WHERE', this.whereClause.toString());
        }
        this.args.push('LIST', format ? format : 'BRIEF');
        this.args.push('/FORMAT:RAWXML');
    }

    find(key) {
        this.__checkIfMethodAllowed('find');
        this.args.push(key);
    }

    call(method, ...args) {
        this.__checkIfMethodAllowed('call');
        if (this.whereClause.toString()) {
            this.args.push('WHERE', this.whereClause.toString());
        }
        this.args = this.args.concat('CALL', method);
        if (args.length) {
            this.args.push(
                args.map(arg => Array.isArray(arg) ? '(' + arg.map(wrapParameter).join(', ') + ')' : wrapParameter(arg))
            );
        }
    }

    create(fields) {
        this.__checkIfMethodAllowed('create');
        this.args.push('CREATE', keyValueToString(fields));
    }

    delete() {
        this.__checkIfMethodAllowed('delete');
        if (this.whereClause.toString()) {
            this.args.push('WHERE', this.whereClause.toString());
        }
        this.args.push('DELETE');
    }

    where(...args) {
        this.__checkIfMethodAllowed('where');
        this.whereClause.where(...args);
    }

    orWhere(...args) {
        this.__checkIfMethodAllowed('orWhere');
        this.whereClause.orWhere(...args);
    }

    toString() {
        const args = [...this.args];
        // if (this.whereClause.toString()) {
        //     args.push('WHERE', this.whereClause.toString());
        // }
        return args.join(' ');
    }

    clone() {
        const query = new Query([...this.args]);
        query.whereClause = this.whereClause.clone();
        query.nextMethodAllowed = [...this.nextMethodAllowed];
        return query;
    }
}

/**
 * Proxy methods and make methods immutable
 */
function proxyMethods(exec, query) {
    const methods = [].concat(END_POINT_METHODS).concat(CHAINABLE_METHODS);
    for (let name of methods) {
        const oldMethod = query[name];
        query[name] = function (...args) {
            const clonedQuery = query.clone();
            proxyMethods(exec, clonedQuery);
            oldMethod.apply(clonedQuery, args);
            if (CHAINABLE_METHODS.indexOf(name) > -1) {
                return clonedQuery;
            } else {
                return exec(clonedQuery.toString());
            }
        }
    }
}

module.exports = {
    createQuery(exec, ...args) {
        const query = new Query(args);
        proxyMethods(exec, query);
        return query;
    }
};