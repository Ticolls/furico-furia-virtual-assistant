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