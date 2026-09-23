import hackathonCatalog from "../data/hackathons.json";

export interface PrizeAmount {
  team: number;
  individual: number;
  currency: string;
}

export interface Prize {
  awardSummary: string | null;
  awardType: string | null;
  additionalInfo: string | null;
  teamMembers: number;
  allocation: string;
  cash: PrizeAmount | null;
  credits: PrizeAmount | null;
  subscriptionValue: PrizeAmount | null;
  subscriptionCount: number | null;
  funding: PrizeAmount | null;
  otherNonCashPrize: string | null;
  physicalAsset: string | null;
  trophyCount: number | null;
}

export interface Hackathon {
  number: number;
  title: string;
  event: string;
  dateLabel: string | null;
  startDate: string | null;
  duration: number | null;
  durationUnit: string | null;
  solution: string | null;
  client: string | null;
  country: string | null;
  location: string | null;
  award: string | null;
  tags: string[];
  categories: string[];
  themeCategories: Array<{
    theme: string;
    category: string;
  }>;
  organizers: string[];
  members: string[];
  githubUrl: string | null;
  eventUrl: string | null;
  socialLinks: {
    linkedin: string[];
    instagram: string[];
    facebook: string[];
  };
  prize: Prize | null;
}

const hackathons = hackathonCatalog satisfies Hackathon[];

export function getHackathons(): Hackathon[] {
  return hackathons;
}

export function getHackathon(number: number): Hackathon | undefined {
  return hackathons.find((hackathon) => hackathon.number === number);
}
