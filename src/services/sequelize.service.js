import { Sequelize } from "sequelize";
import databaseConfig from "../config/databases.js";
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const modelFiles = fs
    .readdirSync(__dirname + "/../models/")
    .filter((file) => file.endsWith(".js"));

let sequelize;
const sequelizeService = {
    init: async () => {
        try {
            if (!sequelize) {
                sequelize = new Sequelize(databaseConfig);

                /*
                  Loading models automatically
                */

                for (const file of modelFiles) {
                    const model = await import(`../models/${file}`);
                    model.default.init(sequelize);
                }

                modelFiles.map(async (file) => {
                    const model = await import(`../models/${file}`);
                    model.default.associate && model.default.associate(sequelize.models);
                });

                sequelize.sync({ force: false }).then(res => {
                    console.log("[SEQUELIZE] Database service initialized");
                })
            }
            return sequelize;

        } catch (error) {
            console.log("[SEQUELIZE] Error during database service initialization");
            throw error;
        }
    },
};

export default sequelizeService;