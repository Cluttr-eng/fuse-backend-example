import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import { FuseController } from "./fuse.controller";
import { FuseService } from "./fuse.service";

const server = express();
server.use(morgan("dev"));
server.use(cors());
server.use(express.json());

const fuseService = new FuseService();
const fuseController = new FuseController(fuseService);

const port = process.env.PORT || 8080;

server.use("/", fuseController.getRouter());

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error_message: "Something unexpected broke in the server" });
};

server.use(errorHandler);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
