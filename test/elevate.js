const elevate = require('sudo-prompt').exec;
const wmic = require('../lib/wmic');
const extract = wmic.extract;
const DateTime = wmic.Types.DateTime;

describe('Elevate Script Environment Test', function() {
    this.timeout(0);
    it('Should pop out an UAC dialog', function (done) {
        function exec(command) {
            return new Promise(function(resolve, reject) {
                elevate(command, {
                    maxBuffer: 10 * 1024 * 1024
                }, function(error, stdout, stderr) {
                    if (error) {
                        reject(error);
                    } else if (stderr.trim()) {
                        reject(new Error(stderr));
                    } else {
                        resolve(extract(stdout));
                    }
                })
            })
        }
        wmic({ exec }).alias('OS').where('Primary', true).call('SetDateTime', new DateTime(new Date(2017, 0, 1)))
            .then(result => done()).catch(done)
    });
});
