process.env.DEBUG = '.*';
var Blockchain = require('../lib/blockchain.js')
, expect = require('expect.js')
_ = require('underscore')
, popular = [
    '1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp',
    '1VayNert3x1KzbpzMGt2qdqrAThiRovi8',
    '1dice97ECuByXAvqXpaYzSaQuPVvrtmz6',
    '1dice9wcMu5hLF4g81u8nioL5mmSHTApw',
    '1dice7fUkz5h4z2wPc1wLMPWgB5mDwKDx',
    '1dice6YgEVBf88erBFra9BHf6ZMoyvG88',
    '1dice7W2AicHosf5EL3GFDUVga7TgtPFn',
    '17qq5A3XKfrxpJRSC5LH6APjvTDb9hTmma',
    '19ngVyAav9JLE6gVfeQB6zgHEpTZhxJ2qJ',
    '14gZfnEn8Xd3ofkjr5s7rKoC3bi8J4Yfyy',
    '1PG1DB6uKdT9uwPBooAjRsNyewmrDrteMT',
    '13ARRimWwGhXt7ozfRy6PTyZcyWxhmM1Gp',
    '1KyYkZ8wJ7ybvGWxSuZqsm6FuthsALSXq5',
    '1HZK8q2RhY718CZee51D5v7xtiHp9T92pN',
    '13c7aMAEoS1QkwK49GctvEE7ZBkSfvaXCo',
    '15tvWYtQq8A4m6N1QGLLADfaLA8C1mKCZv',
    '1PU4vjyEnMTVCmcoAZgVKFByTzbEnEryaX',
    '15svFBR3qDuXoqTR3J2CQAiizNaE4v9CAG',
    '1MtPYAjqohLH5gMq3PH5xKVFWWDxrRQEbh',
    '1MBtmmai5T9kx5LxhkDPCybWXBLaYagFHu',
    '1EekHaBpdaxAFTyYLWApegYWPoBBcgknon',
    '19NmcoeHo2qwEFjQdUrbGuk34SU2fgfDeg',
    '126vMmY1fyznpZiFTTnty3cm1Rw8wuheev',
    '1J15UnwBV2uQtgPpEcmaaEbysqtNBCqMGQ',
    '12K5SyY2Z3DNsqFtTCnyGC3J7jYTCjM54m',
    '1Sb9oSA4bkm7GxPWzubRKtqc4pFa1pf3D'
];

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