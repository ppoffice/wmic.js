'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _sign = require('babel-runtime/core-js/math/sign');

var _sign2 = _interopRequireDefault(_sign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        (0, _classCallCheck3.default)(this, DateTime);

        this.date = date;
    }

    (0, _createClass3.default)(DateTime, [{
        key: 'toString',
        value: function toString() {
            var offset = this.date.getTimezoneOffset();
            var off = String(Math.abs(offset));
            if (off.length < 3) {
                off = new Array(3 - off.length).map(function (i) {
                    return '0';
                }).join('') + off;
            }
            off = ((0, _sign2.default)(offset) === -1 ? '+' : '-') + off;
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
        (0, _classCallCheck3.default)(this, Integer);

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

    (0, _createClass3.default)(Integer, [{
        key: 'toString',
        value: function toString() {
            if (this.digit > 32) {
                return this.value.toString();
            }
            var tmp = this.value.lessThan(0) ? new BigNumber(2).pow(this.digit).plus(this.value) : this.value;
            var hex = tmp.toString(16);
            if (hex.length < this.digit / 4) {
                hex = new Array(this.digit / 4 - hex.length).map(function (i) {
                    return '0';
                }).join('') + hex;
            }
            return '^&H' + hex.toUpperCase();
        }
    }]);
    return Integer;
}();

var SInt8 = function (_Integer) {
    (0, _inherits3.default)(SInt8, _Integer);

    function SInt8(decimal) {
        (0, _classCallCheck3.default)(this, SInt8);
        return (0, _possibleConstructorReturn3.default)(this, (SInt8.__proto__ || (0, _getPrototypeOf2.default)(SInt8)).call(this, decimal, 8, true));
    }

    return SInt8;
}(Integer);

var SInt16 = function (_Integer2) {
    (0, _inherits3.default)(SInt16, _Integer2);

    function SInt16(decimal) {
        (0, _classCallCheck3.default)(this, SInt16);
        return (0, _possibleConstructorReturn3.default)(this, (SInt16.__proto__ || (0, _getPrototypeOf2.default)(SInt16)).call(this, decimal, 16, true));
    }

    return SInt16;
}(Integer);

var SInt32 = function (_Integer3) {
    (0, _inherits3.default)(SInt32, _Integer3);

    function SInt32(decimal) {
        (0, _classCallCheck3.default)(this, SInt32);
        return (0, _possibleConstructorReturn3.default)(this, (SInt32.__proto__ || (0, _getPrototypeOf2.default)(SInt32)).call(this, decimal, 32, true));
    }

    return SInt32;
}(Integer);

var SInt64 = function (_Integer4) {
    (0, _inherits3.default)(SInt64, _Integer4);

    function SInt64(decimal) {
        (0, _classCallCheck3.default)(this, SInt64);
        return (0, _possibleConstructorReturn3.default)(this, (SInt64.__proto__ || (0, _getPrototypeOf2.default)(SInt64)).call(this, decimal, 64, true));
    }

    return SInt64;
}(Integer);

var UInt8 = function (_Integer5) {
    (0, _inherits3.default)(UInt8, _Integer5);

    function UInt8(decimal) {
        (0, _classCallCheck3.default)(this, UInt8);
        return (0, _possibleConstructorReturn3.default)(this, (UInt8.__proto__ || (0, _getPrototypeOf2.default)(UInt8)).call(this, decimal, 8, false));
    }

    return UInt8;
}(Integer);

var UInt16 = function (_Integer6) {
    (0, _inherits3.default)(UInt16, _Integer6);

    function UInt16(decimal) {
        (0, _classCallCheck3.default)(this, UInt16);
        return (0, _possibleConstructorReturn3.default)(this, (UInt16.__proto__ || (0, _getPrototypeOf2.default)(UInt16)).call(this, decimal, 16, false));
    }

    return UInt16;
}(Integer);

var UInt32 = function (_Integer7) {
    (0, _inherits3.default)(UInt32, _Integer7);

    function UInt32(decimal) {
        (0, _classCallCheck3.default)(this, UInt32);
        return (0, _possibleConstructorReturn3.default)(this, (UInt32.__proto__ || (0, _getPrototypeOf2.default)(UInt32)).call(this, decimal, 32, false));
    }

    return UInt32;
}(Integer);

var UInt64 = function (_Integer8) {
    (0, _inherits3.default)(UInt64, _Integer8);

    function UInt64(decimal) {
        (0, _classCallCheck3.default)(this, UInt64);
        return (0, _possibleConstructorReturn3.default)(this, (UInt64.__proto__ || (0, _getPrototypeOf2.default)(UInt64)).call(this, decimal, 64, false));
    }

    return UInt64;
}(Integer);

module.exports = {
    DateTime: DateTime,
    Integer: Integer,
    SInt8: SInt8, SInt16: SInt16, SInt32: SInt32, SInt64: SInt64,
    UInt8: UInt8, UInt16: UInt16, UInt32: UInt32, UInt64: UInt64
};