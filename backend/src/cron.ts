import cron from "node-cron";
import { scrapeMatches } from "./scraper/scrapeMatches";
import { scrapeTimeline } from "./scraper/scrapeTimeline";
import { createClient } from "redis";

export const redisClient = createClient({
    url: "redis://localhost:6379", 
  });
  
  redisClient.connect().catch((err) => {
    console.error("Erro ao conectar ao Redis:", err);
  });
  
  redisClient.on("error", (err: Error) => {
    console.error("Erro no Redis:", err.message);
  });

async function updateCache() {
    try {
      const matches = await scrapeMatches();

      await redisClient.set("furia-matches", JSON.stringify(matches), {
        EX: 300 
      });

      const timeline = await scrapeTimeline();
      await redisClient.set("furia-members-timeline", JSON.stringify(timeline), {
        EX: 300 
      });

      console.log("Cache atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar o cache:", err);
    }
  }
  
  updateCache()
  cron.schedule("*/5 * * * *", updateCache);