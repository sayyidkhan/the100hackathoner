import { getHackathons } from "../../lib/hackathons";
export const GET = () => new Response(JSON.stringify(getHackathons()), { headers: { "Content-Type": "application/json" } });
