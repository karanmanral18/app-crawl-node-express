import dotenv from "dotenv";
import expressService from "./services/express.sevice.js";
import sequelizeService from "./services/sequelize.service.js";
import elasticSearchService from "./services/elastic-search.service.js";
dotenv.config();

const services = [expressService, sequelizeService, elasticSearchService];

(async () => {
    try {
        for (const service of services) {
            await service.init();
        }
        console.log("Server initialized.");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
})();