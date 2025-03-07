import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import globalErrorHandler from "../middlewares/errorHandler.middleware.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routeFiles = fs
    .readdirSync(__dirname + "/../routes/")
    .filter((file) => file.endsWith(".js"));

let server;
let routes = [];

const expressService = {
    init: async () => {
        try {
            /*
              Loading routes automatically
            */
            for (const file of routeFiles) {
                const route = await import(`../routes/${file}`);
                const routeName = Object.keys(route)[0];
                routes.push(route[routeName]);
            }

            server = express();
            server.use(bodyParser.json());

            // Enable CORS for all origins
            server.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
                next();
            });

            server.use(routes);
            server.use(globalErrorHandler);
            server.listen(process.env.APP_PORT);
            console.log("[EXPRESS] Express initialized");
        } catch (error) {
            console.log("[EXPRESS] Error during express service initialization");
            throw error;
        }
    },
};

export default expressService;