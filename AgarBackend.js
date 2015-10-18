/**
 * AgarBackend
 *
 * Connects to a backend agar server and parses messages coming back.
 *
 * Useage:
 *
 * var backend = new AgarBackend();
 * backend.setClient(client);
 * backend.connect();
 *
 * backend.on('board size', ...);
 * backend.on('updates', ...);
 *
 * Events:
 *
 * 'userId' (id)
 *   The user id of the currently playing user.
 *
 * 'updates' (consumptions, entities, destructions)
 *   The most complicated / interesting event.
 *
 *   `consumptions` is an {Array(Object)} where each object has a `consumerId`
 *   and `consumedId`. Note that I am not confident of the "consumer"
 *   interpretation.
 *
 *   `entities` is an {Array(Object)} where each object has:
 *     id {int} Entity identifier.
 *     x {int} Current X position of the entity.
 *     y {int} Current Y position of the entity.
 *     size {int} Radius of the entity.
 *     color {string} Color of entity as a hex string (including '#').
 *     name {string} Name of the entity.
 *     TODO(ibash) document the flags
 *
 *   `destructions` is an {Array(int)} where each item is an id of a entity that
 *   no longer exists.
 *
 * 'boardSize' (x, y)
 *   The size of the game board (in generic units).
 *
 * TODO(ibash) document and add leaderboard and screen position
 */
var _ = require('lodash');
var WebSocket = require('ws');
var events = require('events');
var parser = require('./parser');
var request = require('request');
var util = require('util');

/**
 * AgarBackend
 *
 * @return {undefined}
 */
function AgarBackend(client) {
  _.bindAll(this);
  events.EventEmitter.call(this);
}
util.inherits(AgarBackend, events.EventEmitter);
module.exports = AgarBackend;

/**
 * setClient
 *
 * @param {WebSocket} client Client websocket connection. Messages from client
 *   will be sent to backend and messages from backend will be forwarded to
 *   client.
 * @param {bool} shouldPassMessages Defaults to false. Set to true to pass
 *   messages from client to the agar server. (i.e. control the game from the
 *   client).
 *
 * @return {undefined}
 */
AgarBackend.prototype.setClient = function setClient(client, shouldPassMessages) {
  if (this.client) {
    throw new Error('Client already set');
  }

  this.client = client;
  if (shouldPassMessages) {
    this.initialIncomingBuffer = [];
    this.client.on('message', this.onClientMessage);
  }
  this.client.on('close', this.onClientClose);
};

/**
 * connect
 *
 * Connects to agar.io backend server.
 * TODO Backend server is currently hard coded but can (and should) do a lookup.
 *
 * @return {undefined}
 */
AgarBackend.prototype.connect = function connect() {
  if (!this.client) {
    throw new Error('Set client before connecting backend');
  }

  var self = this;
  this.getServerIP(function(error, ip) {
    if (error) {
      // TODO(ibash) should probably make connect take a callback so that
      // upstream can handle the error. But for right now... ¯\_(ツ)_/¯
      throw error;
    }

    var url = 'ws://' + ip + '/';
    self.socket = new WebSocket(url, {origin: 'http://agar.io'});
    self.socket.on('open', self.onSocketOpen);
    self.socket.on('message', self.onSocketMessage);
    self.socket.on('close', self.onSocketClose);
  });
};

/**
 * send
 *
 * Send a message to the agar.io server.
 *
 * @param {Buffer} buffer
 * @return {undefined}
 */
AgarBackend.prototype.send = function send(buffer) {
  if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
    // TODO(ibash) should I throw an error?
    return;
  }
  this.socket.send(buffer);
};

/**
 * getServerIP
 *
 * Queries agar.io backend to get the ip of a websocket server.
 *
 * @param {function(error, ip)} callback
 */
AgarBackend.prototype.getServerIP = function getServerIP(callback) {
  request.post({
    url: 'https://m.agar.io',
    // TODO(ibash) this always connects to the US-Fremont region -- can change
    // later
    form: {'US-Fremont': ''}
  }, function(error, resp, body) {
    if (error) {
      return callback(error);
    }

    callback(null, body);
  });
};

/**
 * onClientMessage
 *
 * @param data
 * @return {undefined}
 */
AgarBackend.prototype.onClientMessage = function onClientMessage(data) {
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    this.socket.send(data);
  } else if (!this.socket || this.socket.readyState === WebSocket.CONNECTING) {
    this.initialIncomingBuffer.push(data);
  }
};

/**
 * onClientClose
 *
 * @return {undefined}
 */
AgarBackend.prototype.onClientClose = function onClientClose() {
  if (this.socket) {
    this.socket.close();
  }
};

/**
 * onSocketOpen
 *
 * @return {undefined}
 */
AgarBackend.prototype.onSocketOpen = function onSocketOpen() {
  while (this.initialIncomingBuffer && this.initialIncomingBuffer.length) {
    this.socket.send(this.initialIncomingBuffer.pop());
  }
};

/**
 * onSocketMessage
 *
 * @param data
 * @return {undefined}
 */
AgarBackend.prototype.onSocketMessage = function onSocketMessage(data) {
  if (this.client && this.client.readyState === WebSocket.OPEN) {
    this.client.send(data);
  }

  var message = parser.parse(data);
  if (message.type === parser.TYPES.USER_ID) {
    this.emit('userId', message.data.id);
  } else if (message.type === parser.TYPES.UPDATES) {
    this.emit('updates', message.data.consumptions, message.data.entities, message.data.destructions);
  } else if (message.type === parser.TYPES.BOARD_SIZE) {
    this.emit('boardSize', message.data.maxX, message.data.maxY);
  } else if (message.type === parser.TYPES.LEADER_BOARD) {
  } else {
    console.log('unknown message');
    console.log(JSON.stringify(message, null, 2));
  }
};

/**
 * onSocketClose
 *
 * @return {undefined}
 */
AgarBackend.prototype.onSocketClose = function onSocketClose() {
  if (this.client) {
    this.client.close();
  }
};
