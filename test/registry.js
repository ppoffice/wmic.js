const assert = require('assert');
const wmic = require('../src/wmic')();
const unwrap = require('../src/wmic').unwrap;

const KEY_QUERY_VALUE = unwrap('^&H0001');
const HKEY_CURRENT_USER = unwrap('^&H80000001');
const HKEY_LOCAL_MACHINE = unwrap('^&H80000002');

/**
 * Edit Windows Registry Using WMIC
 * @see <a href="https://msdn.microsoft.com/en-us/library/aa393664(v=vs.85).aspx">StdRegProv class</a>
 */
describe('StdRegProv class', function() {
    it('#CheckAccess(hDefKey, sSubKeyName, uRequired)', function(done) {
        wmic.class('StdRegProv').call('CheckAccess', HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet", KEY_QUERY_VALUE)
            .then(result => done(assert.equal(result.bGranted, true))).catch(done);
    });
    it('#CreateKey(hDefKey, sSubKeyName)', function(done) {
        wmic.class('StdRegProv').call('CreateKey', HKEY_CURRENT_USER, '.wmic.js')
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetBinaryValue(hDefKey, sSubKeyName, sValueName, uValue)', function(done) {
        wmic.class('StdRegProv').call('SetBinaryValue', HKEY_CURRENT_USER, '.wmic.js', 'BinaryValue', [1,2,3,4])
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetDWORDValue(hDefKey, sSubKeyName, sValueName, uValue)', function(done) {
        wmic.class('StdRegProv').call('SetDWORDValue', HKEY_CURRENT_USER, '.wmic.js', 'DWORDValue', 250)
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetQWORDValue(hDefKey, sSubKeyName, sValueName, uValue)', function(done) {
        wmic.class('StdRegProv').call('SetQWORDValue', HKEY_CURRENT_USER, '.wmic.js', 'QWORDValue', 4294967295 + 1)
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetExpandedStringValue(hDefKey, sSubKeyName, sValue, sValueName)', function(done) {
        wmic.class('StdRegProv').call('SetExpandedStringValue', HKEY_CURRENT_USER, '.wmic.js', '%ExpandedStringValue%', 'ExpandedStringValue')
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetMultiStringValue(hDefKey, sSubKeyName, sValue, sValueName)', function(done) {
        wmic.class('StdRegProv').call('SetMultiStringValue', HKEY_CURRENT_USER, '.wmic.js', ['string1', 'string2'], 'MultiStringValue')
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#SetStringValue(hDefKey, sSubKeyName, sValue, sValueName)', function(done) {
        wmic.class('StdRegProv').call('SetStringValue', HKEY_CURRENT_USER, '.wmic.js', 'string value', 'StringValue')
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#EnumKey(hDefKey, sSubKeyName)', function(done) {
        wmic.class('StdRegProv').call('CreateKey', HKEY_CURRENT_USER, '.wmic.js\\subkey')
            .then(() => {
                wmic.class('StdRegProv').call('EnumKey', HKEY_CURRENT_USER, '.wmic.js')
                    .then(result => {done(assert.deepEqual(result.sNames, ['subkey']))}).catch(done);
            }).catch(done);
    });
    it('#EnumValues(hDefKey, sSubKeyName)', function(done) {
        wmic.class('StdRegProv').call('EnumValues', HKEY_CURRENT_USER, '.wmic.js')
            .then(result => {done(assert.deepEqual(result.sNames,
                ['BinaryValue', 'DWORDValue', 'QWORDValue', 'ExpandedStringValue', 'MultiStringValue', 'StringValue']))}).catch(done);
    });
    it('#GetBinaryValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetBinaryValue', HKEY_CURRENT_USER, '.wmic.js', 'BinaryValue')
            .then(result => done(assert.deepEqual(result.uValue, [ 1, 2, 3, 4 ]))).catch(done);
    });
    it('#GetDWORDValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetDWORDValue', HKEY_CURRENT_USER, '.wmic.js', 'DWORDValue')
            .then(result => done(assert.equal(result.uValue, 250))).catch(done);
    });
    it('#GetQWORDValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetQWORDValue', HKEY_CURRENT_USER, '.wmic.js', 'QWORDValue')
            .then(result => done(assert.equal(result.uValue, 4294967295 + 1))).catch(done);
    });
    it('#GetExpandedStringValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetExpandedStringValue', HKEY_CURRENT_USER, '.wmic.js', 'ExpandedStringValue')
            .then(result => done(assert.equal(result.sValue, '%ExpandedStringValue%'))).catch(done);
    });
    it('#GetMultiStringValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetMultiStringValue', HKEY_CURRENT_USER, '.wmic.js', 'MultiStringValue')
            .then(result => done(assert.deepEqual(result.sValue, [ 'string1', 'string2' ]))).catch(done);
    });
    it('#GetStringValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('GetStringValue', HKEY_CURRENT_USER, '.wmic.js', 'StringValue')
            .then(result => done(assert.equal(result.sValue, 'string value'))).catch(done);
    });
    it('#DeleteValue(hDefKey, sSubKeyName, sValueName)', function(done) {
        wmic.class('StdRegProv').call('DeleteValue', HKEY_CURRENT_USER, '.wmic.js', 'StringValue')
            .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    });
    it('#DeleteKey(hDefKey, sSubKeyName)', function(done) {
        wmic.class('StdRegProv').call('DeleteKey', HKEY_CURRENT_USER, '.wmic.js\\subkey')
            .then(() => {
                wmic.class('StdRegProv').call('DeleteKey', HKEY_CURRENT_USER, '.wmic.js')
                    .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
            }).catch(done);
    });
});