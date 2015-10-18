var _ = require('lodash');
var fs = require('fs');

var Canvas;
try {
  Canvas = require('canvas');
} catch (error) {
  console.log('Canvas not installed. Cannot export png.');
  return;
}

var SCALE = 10;

exports.render = function render(gameState) {
  var size = gameState.getBoardSize();
  if (!size) {
    return;
  }

  var maxX = size.x / SCALE;
  var maxY = size.y / SCALE;
  var canvas = new Canvas(maxX, maxY);
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, maxX, maxY);

  ctx.save();
  ctx.rect(0, 0, maxX, maxY);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
  
  _.each(gameState.getEntities(), function(entity) {
    ctx.save();
    ctx.strokeStyle = entity.color;
    ctx.fillStyle = entity.color;
    ctx.beginPath();
    ctx.arc(entity.x / SCALE, entity.y / SCALE, entity.size / SCALE, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  });

  return canvas;
};

exports.loop = function loop(gameState) {
  render();

  function render() {
    var canvas = exports.render(gameState);
    if (canvas) {
      fs.writeFile('frame.png', canvas.toBuffer());
    }

    setTimeout(render, 100);
  }
};
