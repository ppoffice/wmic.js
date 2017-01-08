const assert = require('assert');
const wmic = require('../lib/wmic');
const UInt32 = wmic.Types.UInt32;

const KEY_QUERY_VALUE = new UInt32(1);
const HKEY_LOCAL_MACHINE = new UInt32(2147483650);

describe('Wmic switches', function() {
    it('Get wmic context', function (done) {
        wmic().context().then(result => done(assert.equal(result.OUTPUT, 'STDOUT'))).catch(done);
    });
    it('Wmic NAMESPACE switch', function (done) {
        wmic({ namespace: '\\\\root' }).context().then(result => done(assert.equal(result.NAMESPACE.toLowerCase(), 'root'))).catch(done);
    });
    it('Wmic ROLE switch', function (done) {
        wmic({ role: '\\\\root' }).context().then(result => done(assert.equal(result.ROLE.toLowerCase(), 'root'))).catch(done);
    });
    it('Wmic NODE switch: multiple NODEs & fetch information', function (done) {
        wmic({ node: [ '127.0.0.1', 'localhost' ] }).alias('os').list()
            .then(results => done(assert.deepEqual(results[0].result, results[1].result))).catch(done);
    });
    it('Wmic NODE switch: multiple NODEs & method call', function (done) {
        wmic({ node: [ '127.0.0.1', 'localhost' ] }).class('StdRegProv')
            .call('CheckAccess', HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet", KEY_QUERY_VALUE)
            .then(results => done(assert.deepEqual(results[0].result, results[1].result))).catch(done);
    });
    it('Wmic IMPLEVEL switch', function (done) {
        wmic({ implevel: 'Anonymous' }).context().then(result => done(assert.equal(result.IMPLEVEL.toLowerCase(), 'anonymous'))).catch(done);
    });
    it('Wmic AUTHLEVEL switch', function (done) {
        wmic({ authlevel: 'None' }).context().then(result => done(assert.equal(result.AUTHLEVEL.toLowerCase(), 'none'))).catch(done);
    });
    it('Wmic PRIVILEGES switch', function (done) {
        wmic({ privileges: 'DISABLE' }).context().then(result => done(assert.equal(result.PRIVILEGES.toLowerCase(), 'disable'))).catch(done);
    });
    it('Wmic FAILFAST switch', function (done) {
        wmic({ failfast: 'ON' }).context().then(result => done(assert.equal(result.FAILFAST.toLowerCase(), 'on'))).catch(done);
    });
    // it('Wmic USER/PASSWORD switch', function (done) {
    //     // wmic({ node:'remote_address', user: 'username', password: 'password' }).alias('os').list().then(result => console.log(result)).catch(done);
    // });
});