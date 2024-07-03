
import dotenv from 'dotenv';

dotenv.config();

export default {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    debug: process.env.DB_DEBUG,
    define: {
        timestamps: true
    },
};
