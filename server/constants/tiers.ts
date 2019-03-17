import { Ptorx } from 'types/ptorx';

export const TIERS: {
  name: Ptorx.Tier;
  credits: number;
  durations: {
    duration: Ptorx.TierDuration;
    cost: number;
  }[];
}[] = [
  {
    name: 'basic',
    credits: 100,
    durations: [{ duration: 'life', cost: 0 }]
  },
  {
    name: 'premium',
    credits: 1500,
    durations: [
      { duration: 'month', cost: 150 },
      { duration: 'year', cost: 1500 }
    ]
  },
  {
    name: 'ultimate',
    credits: 10000,
    durations: [
      { duration: 'month', cost: 500 },
      { duration: 'year', cost: 5000 }
    ]
  }
];
