const moment = require('moment');
const BigNumber = require('bignumber.js');

/**
 * In the UTC format, dates are displayed as yyyymmddHHMMSS.xxxxxx±UUU, where:
 *
 * yyyy represents the year.
 * mm represents the month.
 * dd represents the day.
 * HH represents the hour (in 24-hour format).
 * MM represents the minutes.
 * SS represents the seconds.
 * xxxxxx represents the milliseconds.
 * UUU represents the difference, in minutes, between the local time zone and Greenwich Mean Time (GMT).
 *
 * @see <a href="https://technet.microsoft.com/en-us/library/ee198928.aspx">Working with Dates and Times using WMI</a>
 */
class DateTime {
    constructor(date) {
        this.date = date;
    }

    toString() {
        const offset = this.date.getTimezoneOffset();
        let off = String(Math.abs(offset));
        if (off.length < 3) {
            off = new Array(3 - off.length).map(i => '0').join('') + off;
        }
        off = (Math.sign(offset) === -1 ? '+' : '-') + off;
        return moment(this.date).format('YYYYMMDDHHmmss.SSS000') + off;
    }
}

/**
 * MOF Integer Numbers
 * @see <a href="https://msdn.microsoft.com/en-us/library/aa392716(v=vs.85).aspx">Number</a>
 */
class Integer {
    constructor(decimal, digit, signed) {
        const base = new BigNumber(2);
        const value = new BigNumber(decimal);
        const range = [ base.toPower(digit - 1).negated(), base.toPower(digit - 1).minus(1) ];
        const urange = [ 0, base.toPower(digit).minus(1) ];

        if (signed && (value.lessThan(range[0]) || value.greaterThan(range[1]))) {
            throw new Error('Number out of range!');
        } else if (!signed && (value.lessThan(urange[0]) || value.greaterThan(urange[1]))) {
            throw new Error('Number out of range!');
        }
        this.value = value;
        this.digit = digit;
    }

    toString() {
        if (this.digit > 32) {
            return this.value.toString();
        }
        const tmp = this.value.lessThan(0) ? new BigNumber(2).pow(this.digit).plus(this.value) : this.value;
        let hex = tmp.toString(16);
        if (hex.length < this.digit / 4) {
            hex = new Array(this.digit / 4 - hex.length).map(i => '0').join('') + hex;
        }
        return '^&H' + hex.toUpperCase();
    }
}

class SInt8 extends Integer {
    constructor(decimal) {
        super(decimal, 8, true);
    }
}

class SInt16 extends Integer {
    constructor(decimal) {
        super(decimal, 16, true);
    }
}

class SInt32 extends Integer {
    constructor(decimal) {
        super(decimal, 32, true);
    }
}

class SInt64 extends Integer {
    constructor(decimal) {
        super(decimal, 64, true);
    }
}

class UInt8 extends Integer {
    constructor(decimal) {
        super(decimal, 8, false);
    }
}

class UInt16 extends Integer {
    constructor(decimal) {
        super(decimal, 16, false);
    }
}

class UInt32 extends Integer {
    constructor(decimal) {
        super(decimal, 32, false);
    }
}

class UInt64 extends Integer {
    constructor(decimal) {
        super(decimal, 64, false);
    }
}

module.exports = {
    DateTime,
    Integer,
    SInt8, SInt16, SInt32, SInt64,
    UInt8, UInt16, UInt32, UInt64
};