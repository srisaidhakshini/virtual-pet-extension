import config from './sizeConfig.json';
export const PET_SIZE = config;
export function normalizePetSize(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(config.min, Math.min(config.max, Math.round(value / config.step) * config.step))
    : config.default;
}
