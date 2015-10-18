/**
 * Controller
 *
 * High level commands to control the player character
 *
 * Useage:
 *
 * var controller = new Controller();
 * controller.setAgarBackend(backend);
 * controller.sendInitMessage();
 * controller.move(x, y);
 * controller.split();
 * controller.ejectMass();
 */
var WebSocket = require('ws');

var COMMANDS = {
  PLAY: 0,
  SPECTATE: 1,
  SPLIT: 17,
  // 18 / 19 seem like they could be to clear the last action? I'm not entirely
  // sure, they're mapped to a keypress of the q key and 19 is also mapped to an onblur
  QUIT: 18,
  CLEAR: 19,
  EJECT_MASS: 21
};

/**
 * Controller
 *
 * @param {WebSocket} backend Connection to backend agar.io server for this
 *   player.
 * @return {Controller}
 */
function Controller(backend) {
  this.backend = backend;
}
module.exports = Controller;

/**
 * setAgarBackend
 *
 * @param {AgarBackend} backend
 * @return {undefined}
 */
Controller.prototype.setAgarBackend = function setAgarBackend(backend) {
  if (this.backend) {
    throw new Error('backend already set');
  }
  this.backend = backend;
};

/**
 * sendInitMessage
 *
 * Send some special tokens to initialize the backend connection.
 * Not sure what this does, was simply in the source.
 *
 * @return {undefined}
 */
Controller.prototype.sendInitMessage = function sendInitMessage() {
  var buffer;
  var view;

  buffer = new ArrayBuffer(5);
  view = new DataView(buffer);
  view.setUint8(0, 254);
  view.setUint32(1, 4, true);
  this.sendToAgarBackend(buffer);

  buffer = new ArrayBuffer(5);
  view = new DataView(buffer);
  view.setUint8(0, 255);
  view.setUint32(1, 673720360, true);
  this.sendToAgarBackend(buffer);
};

/**
 * play
 *
 * Play a new game (i.e. press the "play" button). Note that this does not send
 * the nickname of the user (as the game does).
 *
 * @return {undefined}
 */
Controller.prototype.play = function play() {
  this.sendCommand(COMMANDS.PLAY);
};

/**
 * split
 *
 * @return {undefined}
 */
Controller.prototype.split = function split() {
  this.sendCommand(COMMANDS.SPLIT);
};

/**
 * ejectMass
 *
 * @return {undefined}
 */
Controller.prototype.ejectMass = function ejectMass() {
  this.sendCommand(COMMANDS.EJECT_MASS);
};

/**
 * move
 *
 * Move towards absolute coordinates. This sets a target that the player will
 * continually move towards
 *
 * @param {number} x X coordinate to move towards.
 * @param {number} y Y coordinate to move towards.
 * @return {undefined}
 */
Controller.prototype.move = function move(x, y) {
  buffer = new ArrayBuffer(21);
  view = new DataView(buffer);
  view.setUint8(0, 16);
  view.setFloat64(1, x, true);
  view.setFloat64(9, y, true);
  view.setUint32(17, 0, true);

  this.sendToAgarBackend(buffer);
};

/**
 * sendCommand
 *
 * @param command
 * @return {undefined}
 */
Controller.prototype.sendCommand = function sendCommand(command) {
  var buffer = new ArrayBuffer(1);
  var view = new DataView(buffer);
  view.setUint8(0, command);

  this.sendToAgarBackend(buffer)
};

/**
 * sendToAgarBackend
 *
 * @param {Buffer} buffer
 * @return {undefined}
 */
Controller.prototype.sendToAgarBackend = function sendToAgarBackend(buffer) {
  if (!this.backend) {
    throw new Error('Agar backend not set');
  }
  this.backend.send(buffer);
};
