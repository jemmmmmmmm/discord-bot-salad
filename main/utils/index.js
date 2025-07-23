import fs from 'fs';
import path from 'path';

export const createFsHandlers = (filePath) => {
  return {
    load: () => {
      if (!fs.existsSync(filePath)) return {};

      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.trim() === '' ? {} : JSON.parse(data);
      } catch (e) {
        console.error(`Failed to load JSON from ${filePath}:`, e);
        return {}; // fallback on bad JSON
      }
    },
    save: (data) => {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    },
  };
};
export const generateWeightedFocus = () => {
  const roll = Math.random();

  if (roll < 0.75) return Math.floor(Math.random() * 50); // 0–49 (75%)
  if (roll < 0.93) return Math.floor(Math.random() * 21) + 50; // 50–70 (18%)
  if (roll < 0.985) return Math.floor(Math.random() * 19) + 71; // 71–89 (5.5%)
  if (roll < 0.9975) return Math.floor(Math.random() * 10) + 90; // 90–99 (0.25%)
  return 100; // 100 (0.025%)
};

export const getWeightedDuckStep = () => {
  const roll = Math.random();

  if (roll < 0.35) return 1; // 35%
  if (roll < 0.6) return 2; // 25%
  if (roll < 0.78) return 3; // 18%
  if (roll < 0.88) return 4; // 10%
  if (roll < 0.94) return 5; // 6%
  if (roll < 0.975) return 6; // 3.5%
  if (roll < 0.995) return 7; // 2%
  if (roll < 0.999) return 8; // 0.4%
  if (roll < 0.9999) return 10; // 0.09%
  return 25; // 0.01% chance — **insta-finish**
};

export function getTitle(score) {
  if (score === 100) return 'GODLIKE';
  if (score >= 90) return 'Zen Master';
  if (score >= 80) return 'Disciplined';
  if (score >= 70) return 'Focused';
  if (score >= 60) return 'Calm';
  return undefined;
}
