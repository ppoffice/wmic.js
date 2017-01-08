const assert = require('assert');
const wmic = require('../lib/wmic')();
const UInt32 = require('../lib/wmic').Types.UInt32;

const KEY_QUERY_VALUE = new UInt32(1);
const HKEY_LOCAL_MACHINE = new UInt32(2147483650);

describe('Wmic Query Immutable Tests', function() {
    it('Should return a new Query after #find', function () {
        const Q = wmic.alias('Process');
        const oldQ = Q.toString();
        Q.find(9999);
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #where', function () {
        const Q = wmic.alias('Process');
        const oldQ = Q.toString();
        Q.where('Name', 'LIKE', '%CMD%');
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #orWhere', function () {
        const Q = wmic.alias('Process');
        const oldQ = Q.toString();
        Q.orWhere('Name', 'LIKE', '%CMD%');
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #get', function () {
        const Q = wmic.alias('Process');
        const oldQ = Q.toString();
        Q.get();
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #list', function () {
        const Q = wmic.alias('Process');
        const oldQ = Q.toString();
        Q.list();
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #create', function () {
        const Q = wmic.alias('Environment');
        const oldQ = Q.toString();
        Q.create({'UserName': '%USERDOMAIN%\\%USERNAME%', 'Name': 'EXAMPLE_ENV', 'VariableValue': 1});
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #set', function () {
        const Q = wmic.alias('Environment').where('Name', 'EXAMPLE_ENV');
        const oldQ = Q.toString();
        Q.set({'VariableValue': 3});
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #delete', function () {
        const Q = wmic.alias('Environment').where('Name', 'EXAMPLE_ENV');
        const oldQ = Q.toString();
        Q.delete();
        assert.equal(oldQ === Q.toString(), true);
    });
    it('Should return a new Query after #call', function () {
        const Q = wmic.class('StdRegProv');
        const oldQ = Q.toString();
        Q.call('CheckAccess', HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet", KEY_QUERY_VALUE);
        assert.equal(oldQ === Q.toString(), true);
    });
});