import { Router } from "express";
import clientController from "../controllers/client.controllers.js";

const clientRoutes = Router();

clientRoutes.get("/clients", clientController.getAll);
clientRoutes.get("/:id", clientController.getById);
clientRoutes.post("/clients", clientController.create);
clientRoutes.post("/clients/:id", clientController.update);
clientRoutes.delete("/clients/:id", clientController.delete);

export { clientRoutes };
