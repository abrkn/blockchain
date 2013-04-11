var websocket = require('websocket')
, _ = require('underscore')
, events = require('events')
, debug = require('debug')('blockchain')
, ep = 'ws://ws.blockchain.info/inv';

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

        _.each(this.subs, function(fns, addr) {
            this._subscribe(addr);
        }, this);

        this.conn.on('close', _.bind(this.onClose, this));
        this.conn.on('message', _.bind(this.onMessage, this));
        this.conn.on('error', _.bind(this.onError, this));
        this.emit('connect')
    },

    onMessage: function(packet) {
        if (packet.type != 'utf8') return debug('binary message received');
        debug('raw packet:' +  packet.utf8Data);
        var msg = JSON.parse(packet.utf8Data).x;

        debug('msg:' + JSON.stringify(msg, null, 4));

        var addrs = _.pluck(msg.inputs, 'addr').concat(_.pluck(msg.out, 'addr'));

        debug(addrs.length + ' addresses involved');

        _.each(addrs, function(addr) {
            _.each(this.subs[addr], function(fn) {
                fn(msg);
            });
        }, this);
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

    _subscribe: function(addr) {
        debug('sending address sub to ' + addr);
        this._command({ op: 'addr_sub', 'addr': addr });
    },

    subscribe: function(addr, fn) {
        if (!this.subs[addr] && this.conn) this._subscribe(addr);
        (this.subs[addr] || (this.subs[addr] = [])).push(fn);
    }
});
