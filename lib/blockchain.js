var websocket = require('websocket')
, _ = require('underscore')
, events = require('events')
, debug = require('debug')('blockchain')
, ep = 'wss://ws.blockchain.info/inv';

module.exports = function() {
    this.subs = {};
    this.client = new websocket.client;
    this.client.on('connect', _.bind(this.onConnect, this));
    this.client.on('connectFailed', _.bind(this.onConnectFailed, this));
    this.conn = null;
    this.connect();
};

_.extend(module.exports.prototype, new events.EventEmitter, {
    onConnectFailed: function(err) {
        debug('connect failed:' + err);
        this.emit('connectFailed', err);
    },

    onConnect: function(conn) {
        debug('connected');
        this.conn = conn;

        _.each(this.subs, function(fns, target) {
            if( target == "unconfirmed" ) {
                this._subscribeUnconfirmed();
            } else if( target == "blocks" ) {
                this._subscribeBlocks();
            } else {
                this._subscribeAddr(target);
            }
        }, this);

        this.conn.on('close', _.bind(this.onClose, this));
        this.conn.on('message', _.bind(this.onMessage, this));
        this.conn.on('error', _.bind(this.onError, this));
        this.emit('connect');
    },

    onMessage: function(packet) {
        if (packet.type != 'utf8') return debug('binary message received');
        debug('raw packet:' +  packet.utf8Data);
        var msg = JSON.parse(packet.utf8Data).x
            ,op = JSON.parse(packet.utf8Data).op;

        debug('msg:' + JSON.stringify(msg, null, 4));

        var addrs = _.pluck(msg.inputs, 'addr').concat(_.pluck(msg.out, 'addr'));

        debug(addrs.length + ' addresses involved');

        _.each(addrs, function(addr) {
            _.each(this.subs[addr], function(fn) {
                fn(msg);
            });
        }, this);

        if( op == "utx" && this.subs.unconfirmed ) {
            _.each(this.subs.unconfirmed, function(fn) {
                fn(msg);
            });
        }

        if( op == "block" && this.subs.blocks ) {
            _.each(this.subs.blocks, function(fn) {
                fn(msg);
            });
        }
    },

    close: function() {
        this.conn && this.conn.close();
    },

    onClose: function() {
        debug('closed');
        this.conn = null;
        this.emit('disconnect');
    },

    onError: function(err) {
        debug('error:' + err);
        this.emit('error', err);
    },

    connect: function() {
        debug('connecting');
        this.client.connect(ep);
    },

    _command: function(msg) {
        var encoded = JSON.stringify(msg);
        debug('--> ' + encoded);
        this.conn.sendUTF(encoded);
    },

    _subscribeAddr: function(addr) {
        debug('sending address sub to ' + addr);
        this._command({ op: 'addr_sub', 'addr': addr });
    },

    subscribeAddr: function(addr, fn) {
        if (!this.subs[addr] && this.conn) this._subscribeAddress(addr);
        (this.subs[addr] || (this.subs[addr] = [])).push(fn);
    },

    subscribe: function(addr, fn) {
        this.subscribeAddr(addr, fn);
    },

    _subscribeUnconfirmed: function() {
        debug('sending unconfirmed transaction sub');
        this._command({ op: 'unconfirmed_sub' });
    },

    subscribeUnconfirmed: function(fn) {
        if (!this.subs.unconfirmed && this.conn) this._subscribeUnconfirmed();
        (this.subs.unconfirmed || (this.subs.unconfirmed = [])).push(fn);
    },

    _subscribeBlocks: function() {
        debug('sending unconfirmed blocks sub');
        this._command({ op: 'blocks_sub' });
    },

    subscribeBlocks: function(fn) {
        if (!this.subs.blocks && this.conn) this._subscribeBlocks();
        (this.subs.blocks || (this.subs.blocks = [])).push(fn);
    }
});
