process.env.DEBUG = '.*';
var Blockchain = require('../lib/blockchain.js')
, expect = require('expect.js')
, _ = require('underscore')
, popular = require('./popular.json');

describe('blockchain', function() {
    describe('subscribe', function() {
        it('should see transactions on a popular address', function(done) {
            this.timeout(10 * 60 * 1000);

            var blockchain = new Blockchain();

            _.each(popular, function(addr) {
                blockchain.subscribe(addr, function(tran) {
                    if (!done) return;
                    blockchain.close();
                    done();
                    done = null;
                });
            });
        });
    });
});