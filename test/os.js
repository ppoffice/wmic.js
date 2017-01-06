'use strict';
const assert = require('assert');
const wmic = require('../src/wmic')();
const DateTime = require('../src/Types').DateTime;

describe('Operating System(OS)', function() {
    let serialNumber;
    it('List all OS information', function (done) {
        wmic.alias('OS').get().then(result => {
            if (result.length > 0) {
                serialNumber = result[0].SerialNumber;
            }
            done(assert.equal(result.length, 1))
        }).catch(done);
    });
    it('Get primary OS information', function (done) {
        wmic.alias('OS').where('primary', true).list()
            .then(result => done(assert.equal(result.length, 1))).catch(done);
    });
    it('Get the OS information through serial number', function (done) {
        wmic.alias('OS').where('SerialNumber', serialNumber).list()
            .then(result => done(assert.equal(result[0].SerialNumber, serialNumber))).catch(done);
    });
    // it('Set system date and time', function (done) {
    //     // You must have the privilege to successfully invoke the SetDateTime method.
    //     wmic.alias('OS').where('primary', true).call('SetDateTime', new DateTime(new Date()))
    //         .then(result => done(assert.equal(result.ReturnValue, 0))).catch(done);
    // });
    // it('Reboot the system:)', function (done) {
    //     // You must have the Shutdown privilege to successfully invoke the Shutdown method.
    //     wmic.alias('OS').where('SerialNumber', serialNumber).call('Reboot')
    //         .then(result => done(assert.equal(result[0].SerialNumber, serialNumber))).catch(done);
    // });
});