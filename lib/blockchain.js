var websocket = require('websocket')
, _ = require('underscore')
, events = require('events')
, debug = require('debug')('blockchain')
, ep = 'ws://api.blockchain.info:8335/inv';

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
    },

    onMessage: function(msg) {
        if (msg.type != 'utf8') return debug('binary message received');
        debug('msg:' + msg.utf8Data);

        var addrs = _.pluck(msg.inputs, 'addr').concat(_.pluck(msg.outputs, 'addr'));

        _.each(addrs, function(addr) {
            _.each(this.subs[addr], function(fn) {
                fn(msg.x);
            });
        }, this);
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

    subscribe: function(addr) {
        if (!this.subs[addr] && this.conn) this._subscribe(adddr);
        (this.subs[addr] || (this.subs[addr] = [])).push(addr);
    }
});