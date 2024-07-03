import axios from 'axios';
import * as cheerio from 'cheerio';
import Client from './models/Client.js';
import sequelizeService from "./services/sequelize.service.js";

(async () => {
    try {
        await sequelizeService.init();
        console.log("[SEQUELIZE] Database service initialized");
        await run();
    } catch (error) {
        console.error("[SEQUELIZE] Error initializing database:", error);
    }
})();

async function run() {
    const baseUrl =
        'https://www.companydetails.in/latest-registered-company-mca';
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);
    const anchorElements = $('a.fs-6.text-uppercase');

    // Extract URLs and store them in an array
    const urls = anchorElements
        .map((_, element) => $(element).attr('href'))
        .get();

    for (const url of urls) {
        const completeUrl = 'https://www.companydetails.in/' + url;
        const { data } = await axios.get(completeUrl);
        const $ = cheerio.load(data);

        // Find all divs with the target class
        const targetDivs = $(
            '.bg-white.justify-content-between.align-items-center.p-2.border-bottom',
        );

        const client = {};
        targetDivs.each((_, element) => {
            // Check for anchors with different text content
            const pinCodeAnchor = $(element).find('a:contains("PIN Code")');
            const companyNameAnchor = $(element).find('a:contains("Company Name")');
            const emailAnchor = $(element).find('a:contains("Email")');
            const cinAnchor = $(element).find('a:contains("CIN")');

            // Extract data based on the found anchor
            if (pinCodeAnchor.length > 0) {
                client.pin = $(element).find('h6').text().trim();
            }
            if (companyNameAnchor.length > 0) {
                client.name = $(element).find('h6').text().trim();
            }
            if (emailAnchor.length > 0) {
                if (client.email) return;
                client.email = $(element).find('h6').text().trim();
            }
            if (cinAnchor.length > 0) {
                client.cin = $(element).find('h6').text().trim();
            }
        });
        console.log('Creating client', client);
        try {
            await Client.create(client);
        } catch (error) {
            console.log(error);
        }
    }
}