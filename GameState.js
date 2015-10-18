/**
 * GameState
 *
 * Current state of the agar game.
 * Listens to events from an AgarBackend and updates state accordingly.
 *
 * Useage:
 *
 * var state = new GameState();
 * state.setAgarBackend(backend);
 * state.getUserId();
 * state.getEntities();
 * ...
 */

var _ = require('lodash');

/**
 * GameState
 *
 * @return {undefined}
 */
function GameState() {
  _.bindAll(this);
  this.entities = {};
}
module.exports = GameState;

/**
 * setAgarBackend
 *
 * @param {AgarBackend} backend
 * @return {undefined}
 */
GameState.prototype.setAgarBackend = function setAgarBackend(backend) {
  if (this.backend) {
    throw new Error('Agar backend already set');
  }

  this.backend = backend;
  this.backend.on('boardSize', this.onBoardSize);
  this.backend.on('updates', this.onUpdates);
  this.backend.on('userId', this.onUserId);
};

/**
 * getBoardSize
 *
 * @return {Object} like:
 *   x: Max "x" value in generic units.
 *   y: Max "y" value in generic units.
 */
GameState.prototype.getBoardSize = function getBoardSize() {
  return this.boardSize;
};

/**
 * getUserId
 *
 * @return {number}
 */
GameState.prototype.getUserId = function getUserId() {
  return this.userId;
};

/**
 * getUserEntity
 *
 * @return {Object | undefined}
 */
GameState.prototype.getUserEntity = function getUserEntity() {
  if (this.userId) {
    return this.entities[this.userId];
  }
};

/**
 * getEntities
 *
 * @return {Array(Object)} Where each object is like:
 *   TODO(ibash) document an entity
 */
GameState.prototype.getEntities = function getEntities() {
  return this.entities;
};

/**
 * onBoardSize
 *
 * @param {number} x
 * @param {number} y
 * @return {undefined}
 */
GameState.prototype.onBoardSize = function onBoardSize(x, y) {
  this.boardSize = {x: x, y: y};
};

/**
 * onUserId
 *
 * @param {number} userId
 * @return {undefined}
 */
GameState.prototype.onUserId = function onUserId(userId) {
  this.userId = userId;
};

/**
 * onUpdates
 *
 * @param consumptions
 * @param entities
 * @param destructions
 * @return {undefined}
 */
GameState.prototype.onUpdates = function onUpdates(consumptions, entities, destructions) {
  var self = this;

  _.each(consumptions, function(consumption) {
    if (self.entities[consumption.consumedId]) {
      delete self.entities[consumption.consumedId];
    }
  });

  _.each(entities, function(entity) {
    self.entities[entity.id] = entity;
  });

  _.each(destructions, function(id) {
    delete self.entities[id]
  });
};
