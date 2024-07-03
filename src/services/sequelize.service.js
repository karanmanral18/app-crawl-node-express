import { Sequelize } from "sequelize";
import databaseConfig from "../config/databases";
import fs from "fs";

const modelFiles = fs
    .readdirSync(__dirname + "/../models/")
    .filter((file) => file.endsWith(".js"));

const sequelizeService = {
    init: async () => {
        try {
            const sequelize = new Sequelize(databaseConfig);

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

        } catch (error) {
            console.log("[SEQUELIZE] Error during database service initialization");
            throw error;
        }
    },
};

export default sequelizeService;