import { getHackathon } from "./hackathons";

export interface CaseStudy {
  number: number;
  angle: string;
  purpose: string;
  scope: string;
  outcomeContext: string;
  operatorQuestion: string;
  nextValidation: string;
}

// Build facts and awards live in the catalog. These editorial notes deliberately
// distinguish project intent from unverified adoption or commercial outcomes.
const caseStudies: CaseStudy[] = [
  {
    number: 79,
    angle: "A visitor experience for a real local business",
    purpose: "The project focuses on the visitor journey for Long Taa, a Sebup longhouse village in Sarawak: exploring the destination and planning a trip.",
    scope: "The recorded build combines a bilingual digital visitor experience, trip planning, and a Kimi-powered visitor assistant. This puts destination information and visitor questions in the same experience.",
    outcomeContext: "The catalog records First Runner-Up, US$200 in Kimi AI credits for the team, and a trophy. It does not record visitor adoption, bookings, or revenue after the event.",
    operatorQuestion: "Can the visitor assistant help people move from interest to a qualified trip inquiry, and can the business keep its answers accurate?",
    nextValidation: "Test the planning flow with prospective visitors and the village operator. Track whether visitors can find the information they need and complete an inquiry; have the operator review assistant answers before expanding the service.",
  },
  {
    number: 80,
    angle: "Turning destination exploration into a personal experience",
    purpose: "The project explores a way to experience a destination before visiting: navigate a real 3D city, then imagine yourself there through generated travel scenes.",
    scope: "The recorded build uses a flying crow to explore the city and generates AI travel scenes featuring the user at their destination. The catalog documents the experience, but not the team's internal architecture or implementation tradeoffs.",
    outcomeContext: "The catalog records Best Project — Best Use of GPT-Image-2.5, with US$5,000 in OpenAI credits per team member. It does not record repeat usage, paying customers, or a travel booking conversion rate.",
    operatorQuestion: "Does a personalized travel scene create enough value for people to return, share, or pay beyond their first exploration?",
    nextValidation: "Observe first-time users exploring one destination and generating a scene. Measure completion, willingness to share, and repeat use. Compare generation cost with willingness to pay before committing to a business model.",
  },
  {
    number: 81,
    angle: "Making peer-pressure choices interactive",
    purpose: "The project addresses the anti-drug theme through a storybook adventure: help Bob navigate peer pressure and find a safe way home.",
    scope: "The recorded interaction asks players to sketch solutions within an illustrated story. The catalog describes the game concept, but does not establish learning effectiveness or provide participant research.",
    outcomeContext: "The catalog documents the project at Anti-Drug Jam 2026 and links to its source code. No award or post-event adoption outcome is recorded.",
    operatorQuestion: "Do the drawing interactions help the intended audience understand and recall safer choices in a peer-pressure situation?",
    nextValidation: "Review the story with educators or programme facilitators, then run a supervised playtest with the intended audience. Check comprehension before and after play and identify where drawing helps or interrupts the lesson.",
  },
];

export function getCaseStudy(number: number): CaseStudy | undefined {
  return caseStudies.find((study) => study.number === number);
}

export function getCaseStudies() {
  return caseStudies.flatMap((study) => {
    const hackathon = getHackathon(study.number);
    return hackathon ? [{ ...study, hackathon }] : [];
  });
}
