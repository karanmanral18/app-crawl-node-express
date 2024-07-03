import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import { clientIndex } from '../constants/elastic-search.js';
dotenv.config();

let elasticClientInstance;

const elasticSearchService = {
    init: async () => {
        // check for singleton instance of elasticClientInstance
        if (!elasticClientInstance) {
            try {
                elasticClientInstance = new Client({
                    node: process.env.ELASTIC_SEARCH_URL,
                    auth: {
                        username: process.env.ELASTIC_SEARCH_USERNAME,
                        password: process.env.ELASTIC_SEARCH_PASSWORD,
                    },
                    maxRetries: 5,
                    requestTimeout: 60000,
                    sniffOnStart: true,
                });
                console.log("[ELASTIC-SEARCH] Elastic search service initialized");
                return elasticClientInstance;
            } catch (error) {
                console.log("[ELASTIC-SEARCH] Error during elastic search initialization");
                throw error;
            }
        }
        return elasticClientInstance;
    },
    create: async (clientData) => {
        try {
            const data = elasticSearchService.prepareClientDocument(clientData);
            const response = await elasticClientInstance.bulk(data);
            console.log("[ELASTIC-SEARCH] Create response:", response);
            return response;
        } catch (error) {
            console.error("[ELASTIC-SEARCH] Error during client creation:", error);
            throw error;
        }
    },
    delete: async (clientId) => {
        try {
            const data = {
                index: clientIndex._index,
                id: clientId,
            };
            const response = await elasticClientInstance.delete(data);
            console.log("[ELASTIC-SEARCH] Delete response:", response);
            return response;
        } catch (error) {
            console.error("[ELASTIC-SEARCH] Error during client deletion:", error);
            throw error;
        }
    },
    update: async (clientData) => {
        try {
            const data = elasticSearchService.prepareClientDocument(clientData);
            await elasticSearchService.delete(clientData);
            const response = await elasticSearchService.create(data)
            console.log("[ELASTIC-SEARCH] Update response:", response);
            return response;
        } catch (error) {
            console.error("[ELASTIC-SEARCH] Error during client updation:", error);
            throw error;
        }
    },
    bulkIndex: (clientId) => {
        return {
            _index: clientIndex._index,
            _id: clientId,
        };
    },
    findOneById: async (id) => {
        try {
            const data = {
                index: clientIndex._index,
                id: id,
            };
            const response = await elasticClientInstance.get(data);
            return response._source;
        } catch (error) {
            console.error("[ELASTIC-SEARCH] Error during document retrieval:", error);
            throw error;
        }
    },
    prepareClientDocument: (client) => {
        const bulk = [];
        bulk.push({
            index: elasticSearchService.bulkIndex(client.id),
        });
        bulk.push(client);
        return {
            body: bulk,
            index: clientIndex._index,
        };
    },
    createElasticSearchPayload: (filters) => {
        const shouldClauses = [];

        if (filters) {
            if (filters.id) shouldClauses.push({ match: { id: filters.id } });
            if (filters.name) shouldClauses.push({ match: { name: filters.name } });
            if (filters.email) shouldClauses.push({ match: { email: filters.email } });
            if (filters.cin) shouldClauses.push({ match: { cin: filters.cin } });
        }

        let query;
        if (shouldClauses.length > 0) {
            query = {
                bool: {
                    should: shouldClauses,
                },
            };
        } else {
            query = { match_all: {} };
        }
        let fromRecord = 0;
        if (filters.perPage && filters.page) {
            fromRecord = Number(filters.perPage) * (Number(filters.page) - 1);
        }
        else {
            filters.perPage = 10;
            fromRecord = 1;
        }
        return { size: Number(filters.perPage), from: fromRecord, query: query };
    },
    createSearchObject: (filters) => {
        const body = elasticSearchService.createElasticSearchPayload(filters);
        return { index: clientIndex._index, ...body };
    },
    searchIndex: async (filters) => {
        try {
            const searchData = elasticSearchService.createSearchObject(filters);
            return elasticClientInstance.search(searchData);
        } catch (error) {
            console.error("[ELASTIC-SEARCH] Error during client search:", error);
            throw error;
        }
    },
};

export default elasticSearchService;