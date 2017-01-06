'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');
var BigNumber = require('bignumber.js');

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

var DateTime = function () {
    function DateTime(date) {
        _classCallCheck(this, DateTime);

        this.date = date;
    }

    _createClass(DateTime, [{
        key: 'toString',
        value: function toString() {
            var offset = this.date.getTimezoneOffset();
            var off = String(Math.abs(offset));
            if (off.length < 3) {
                off = new Array(3 - off.length).fill('0').join('') + off;
            }
            off = (Math.sign(offset) === -1 ? '+' : '-') + off;
            return moment(this.date).format('YYYYMMDDHHmmss.SSS000') + off;
        }
    }]);

    return DateTime;
}();

/**
 * MOF Integer Numbers
 * @see <a href="https://msdn.microsoft.com/en-us/library/aa392716(v=vs.85).aspx">Number</a>
 */


var Integer = function () {
    function Integer(decimal, digit, signed) {
        _classCallCheck(this, Integer);

        var base = new BigNumber(2);
        var value = new BigNumber(decimal);
        var range = [base.toPower(digit - 1).negated(), base.toPower(digit - 1).minus(1)];
        var urange = [0, base.toPower(digit).minus(1)];

        if (signed && (value.lessThan(range[0]) || value.greaterThan(range[1]))) {
            throw new Error('Number out of range!');
        } else if (!signed && (value.lessThan(urange[0]) || value.greaterThan(urange[1]))) {
            throw new Error('Number out of range!');
        }
        this.value = value;
        this.digit = digit;
    }

    _createClass(Integer, [{
        key: 'toString',
        value: function toString() {
            if (this.digit > 32) {
                return this.value.toString();
            }
            var tmp = this.value.lessThan(0) ? new BigNumber(2).pow(this.digit).plus(this.value) : this.value;
            var hex = tmp.toString(16);
            if (hex.length < this.digit / 4) {
                hex = new Array(this.digit / 4 - hex.length).fill('0').join('') + hex;
            }
            return '^&H' + hex.toUpperCase();
        }
    }]);

    return Integer;
}();

var SInt8 = function (_Integer) {
    _inherits(SInt8, _Integer);

    function SInt8(decimal) {
        _classCallCheck(this, SInt8);

        return _possibleConstructorReturn(this, (SInt8.__proto__ || Object.getPrototypeOf(SInt8)).call(this, decimal, 8, true));
    }

    return SInt8;
}(Integer);

var SInt16 = function (_Integer2) {
    _inherits(SInt16, _Integer2);

    function SInt16(decimal) {
        _classCallCheck(this, SInt16);

        return _possibleConstructorReturn(this, (SInt16.__proto__ || Object.getPrototypeOf(SInt16)).call(this, decimal, 16, true));
    }

    return SInt16;
}(Integer);

var SInt32 = function (_Integer3) {
    _inherits(SInt32, _Integer3);

    function SInt32(decimal) {
        _classCallCheck(this, SInt32);

        return _possibleConstructorReturn(this, (SInt32.__proto__ || Object.getPrototypeOf(SInt32)).call(this, decimal, 32, true));
    }

    return SInt32;
}(Integer);

var SInt64 = function (_Integer4) {
    _inherits(SInt64, _Integer4);

    function SInt64(decimal) {
        _classCallCheck(this, SInt64);

        return _possibleConstructorReturn(this, (SInt64.__proto__ || Object.getPrototypeOf(SInt64)).call(this, decimal, 64, true));
    }

    return SInt64;
}(Integer);

var UInt8 = function (_Integer5) {
    _inherits(UInt8, _Integer5);

    function UInt8(decimal) {
        _classCallCheck(this, UInt8);

        return _possibleConstructorReturn(this, (UInt8.__proto__ || Object.getPrototypeOf(UInt8)).call(this, decimal, 8, false));
    }

    return UInt8;
}(Integer);

var UInt16 = function (_Integer6) {
    _inherits(UInt16, _Integer6);

    function UInt16(decimal) {
        _classCallCheck(this, UInt16);

        return _possibleConstructorReturn(this, (UInt16.__proto__ || Object.getPrototypeOf(UInt16)).call(this, decimal, 16, false));
    }

    return UInt16;
}(Integer);

var UInt32 = function (_Integer7) {
    _inherits(UInt32, _Integer7);

    function UInt32(decimal) {
        _classCallCheck(this, UInt32);

        return _possibleConstructorReturn(this, (UInt32.__proto__ || Object.getPrototypeOf(UInt32)).call(this, decimal, 32, false));
    }

    return UInt32;
}(Integer);

var UInt64 = function (_Integer8) {
    _inherits(UInt64, _Integer8);

    function UInt64(decimal) {
        _classCallCheck(this, UInt64);

        return _possibleConstructorReturn(this, (UInt64.__proto__ || Object.getPrototypeOf(UInt64)).call(this, decimal, 64, false));
    }

    return UInt64;
}(Integer);

module.exports = {
    DateTime: DateTime,
    Integer: Integer,
    SInt8: SInt8, SInt16: SInt16, SInt32: SInt32, SInt64: SInt64,
    UInt8: UInt8, UInt16: UInt16, UInt32: UInt32, UInt64: UInt64
};