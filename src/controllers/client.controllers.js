import * as Yup from "yup";
import Client from "../models/Client.js";
import { Sequelize } from "sequelize";
import elasticSearchService from "../services/elastic-search.service.js";
import sequelizeService from "../services/sequelize.service.js";

const sequelize = await sequelizeService.init();

const clientSchema = Yup.object().shape({
    name: Yup.string().required("Client name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    cin: Yup.string()
        .required("CIN is required")
        .length(21, "CIN must be exactly 21 digits"),
    pin: Yup.string()
        .required("PIN is required")
        .length(6, "PIN must be exactly 6 digits"),
});

let clientController = {
    getAll: async (req, res, next) => {
        try {
            const clients = await Client.findAll();
            return res.status(200).json(clients);
        } catch (error) {
            next(error);
        }
    },

    getAllFromElasticSearch: async (req, res, next) => {
        try {
            const data = await elasticSearchService.searchIndex(req.query);
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getByIdFromElasticSeaarch: async (req, res, next) => {
        try {
            const { id } = req.params;
            const client = await elasticSearchService.findOneById(id);
            if (!client) {
                return res.status(404).json({ message: "Client not found" });
            }
            return res.status(200).json(client);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const client = await Client.findByPk(id);
            if (!client) {
                return res.status(404).json({ message: "Client not found" });
            }
            return res.status(200).json(client);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        let transaction;
        try {
            const { body } = req;
            await clientSchema.validate(body, { abortEarly: false });

            // Check for existing email or pin before creating
            const existingClient = await Client.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { email: body.email },
                        { cin: body.cin },
                    ],
                },
            });

            if (existingClient) {
                const existingField = existingClient.email === body.email ? 'email' : 'pin';
                return res.status(409).json({ type: 'error', message: `Duplicate ${existingField} found.` });
            }

            transaction = await sequelize.transaction();
            const newClient = await Client.create(body);
            await elasticSearchService.create(newClient);
            await transaction.commit();

            // record in elastic search will be created via sequelize -> after create hook -> src/models/Client.js
            return res.status(201).json(newClient);
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            if (error.name === "ValidationError") {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    },

    update: async (req, res, next) => {
        let transaction;
        try {
            const { id } = req.params;
            const { body } = req;
            await clientSchema.validate(body, { abortEarly: false });

            const existingClient = await Client.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { email: body.email },
                        { cin: body.cin },
                    ],
                },
            });

            if (existingClient && existingClient.id !== Number(id)) {
                const existingField = existingClient.email === body.email ? 'email' : 'pin';
                return res.status(409).json({ type: 'error', message: `Duplicate ${existingField} found.` });
            }

            transaction = await sequelize.transaction();
            const client = await Client.findOne({
                where: { id },
            });
            if (client) {
                const updatedClient = await client.update({
                    ...body,
                    id: id
                });
                await elasticSearchService.update(updatedClient.dataValues);
                await transaction.commit();
                return res.status(200).json(updatedClient);
            } else {
                return res.status(404).json({ message: "Client not found" });
            }

        } catch (error) {
            // if (transaction) {
            //     await transaction.rollback();
            // }
            if (error.name === "ValidationError") {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    },

    delete: async (req, res, next) => {
        let transaction;
        try {
            const { id } = req.params;
            transaction = await sequelize.transaction();
            const deletedCount = await Client.destroy({ where: { id } });
            await elasticSearchService.delete(id);
            await transaction.commit();

            if (deletedCount === 0) {
                return res.status(404).json({ message: "Client not found" });
            }
            return res.status(204).json();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            next(error);
        }
    },
};

export default clientController;
