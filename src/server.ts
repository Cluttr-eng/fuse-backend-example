import express from 'express';
import * as dotenv from 'dotenv';
import { FuseController } from './fuse.controller';
import {FuseService} from "./fuse.service";

dotenv.config();

const server = express();
server.use(express.json());

const fuseService = new FuseService();
const fuseController = new FuseController(fuseService);

const port = process.env.PORT || 8080;

server.use('/', fuseController.getRouter());

server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
