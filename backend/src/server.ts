import express from "express";
import furiaRoutes from "./routes/furiaRoutes";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { FRONTEND_URL, PORT } from "./config/config";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(sessionMiddleware);

app.use(furiaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
