import { Router } from "express";
import clientController from "../controllers/client.controllers.js";

const clientRoutes = Router();

clientRoutes.get("/clients", clientController.getAll);
clientRoutes.get("/clients/elastic/search", clientController.getAllFromElasticSearch);
clientRoutes.post("/clients", clientController.create);
clientRoutes.get("/clients/:id", clientController.getById);
clientRoutes.post("/clients/:id", clientController.update);
clientRoutes.delete("/clients/:id", clientController.delete);

export { clientRoutes };
