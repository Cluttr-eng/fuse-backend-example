import express, { ErrorRequestHandler } from "express";
import * as dotenv from "dotenv";
import { FuseController } from "./fuse.controller";
import { FuseService } from "./fuse.service";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const server = express();
server.use(morgan("dev"));
server.use(cors());
server.use(express.json());

const fuseService = new FuseService();
const fuseController = new FuseController(fuseService);

const port = process.env.PORT || 8080;

server.use("/", fuseController.getRouter());

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(JSON.stringify(err, null, 2));
  res
    .status(500)
    .json({ error_message: "Something unexpected broke in the server" });
};

server.use(errorHandler);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
