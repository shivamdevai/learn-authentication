import express from "express";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.set("trust proxy", true); // Trust reverse proxy so req.ip returns the actual client IP instead of the proxy IP.
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(`/api/v1/auth`, authRouter);

app.use(errorMiddleware);

export default app;
