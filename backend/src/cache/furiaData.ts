import { redisClient } from "./redis";

type Match = {
    date: string;
    tier: string;
    type: string;
    opponent1: string;
    opponent2: string;
    score: string;
};

type TimelineEntry = {
    year: string; 
    date: string;
    description: string;
    links: { title: string; url: string }[];
};


async function getMatchesFromRedis(): Promise<Match[]> {
  const raw = await redisClient.get("furia-matches");
  if (!raw) return [];
  return JSON.parse(raw);
}

function filterMatchesByPeriod(matches: Match[], period: `${number}-${number}`): Match[] {
    const [startYear, endYear] = period.split("-").map(Number);
  
    return matches.filter(match => {
      const cleanedDate = match.date.split(" - ")[0];
      const matchYear = new Date(cleanedDate).getFullYear();
      return matchYear >= startYear && matchYear <= endYear;
    });
  }

export async function getFilteredMatches(period: `${number}-${number}`): Promise<Match[]> {
    const matches = await getMatchesFromRedis();
    return filterMatchesByPeriod(matches, period);
}

export async function getTimelineFromRedis(): Promise<TimelineEntry[]> {
    const raw = await redisClient.get("furia-members-timeline");
    if (!raw) return [];
    return JSON.parse(raw);
}

function filterTimeline(
    timeline: TimelineEntry[],
  ): { year: string; date: string; description: string; }[] {
    return timeline.map(entry => {
        const { links, ...rest } = entry;
        return rest;
    })
}

export async function getFilteredTimeline(): Promise<{ year: string; date: string; description: string; }[]> {
    const timeline = await getTimelineFromRedis();
    return filterTimeline(timeline);
}