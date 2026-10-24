const PET_WIDTH = 160;
const PET_HEIGHT = 180;
function clampPosition(position, area, bounds = { width: PET_WIDTH, height: PET_HEIGHT }) {
  return {
    x: Math.round(Math.max(area.x, Math.min(area.x + Math.max(0, area.width - bounds.width), position.x))),
    y: Math.round(Math.max(area.y, Math.min(area.y + Math.max(0, area.height - bounds.height), position.y))),
  };
}
function stepToward(position, target, seconds) {
  const dx = target.x - position.x, dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  const step = Math.min(distance, 58 * Math.min(seconds, 0.1));
  return {
    x: distance ? position.x + dx / distance * step : position.x,
    y: distance ? position.y + dy / distance * step : position.y,
    direction: dx < 0 ? 'left' : 'right',
    arrived: distance < 2,
  };
}
function getPetBounds(value) {
  const config = require('../src/pet/sizeConfig.json');
  const size = typeof value === 'number' && Number.isFinite(value) ? Math.max(config.min, Math.min(config.max, Math.round(value / config.step) * config.step)) : config.default;
  return { width: size + 24, height: size + 44 };
}
module.exports = { PET_WIDTH, PET_HEIGHT, getPetBounds, clampPosition, stepToward };
