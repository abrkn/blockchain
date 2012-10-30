process.env.DEBUG = '.*';
var addr = process.argv[2] || '1Kk26TMvgxFavxuLTNdkmh7iHzs2A7524y'
blockchain = new (require('../lib/blockchain'));

blockchain.subscribe(addr, function(msg) {
    console.log(JSON.stringify(msg, null, 4));
});