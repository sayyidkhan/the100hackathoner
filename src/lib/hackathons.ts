import hackathonCatalog from "../data/hackathons.json";

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
  organizers: string[];
  members: string[];
  githubUrl: string | null;
  eventUrl: string | null;
  socialLinks: {
    linkedin: string[];
    instagram: string[];
    facebook: string[];
  };
}

const hackathons = hackathonCatalog satisfies Hackathon[];

export function getHackathons(): Hackathon[] {
  return hackathons;
}

export function getHackathon(number: number): Hackathon | undefined {
  return hackathons.find((hackathon) => hackathon.number === number);
}
