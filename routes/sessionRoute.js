import { Router } from "express";
import { sessionCreate } from "../controller/session/sessionCreate.js";
import { sessionDelete } from "../controller/session/sessionDelete.js";
import { sessionGetAll } from "../controller/session/sessionGetAll.js";
import { sessionGetById } from "../controller/session/sessionGetById.js";


const sessionRoute = Router();

sessionRoute.post("/sessionCreate", sessionCreate);
sessionRoute.post("/sessionDelete/:session_id", sessionDelete);
sessionRoute.post("/sessionGetAll", sessionGetAll);
sessionRoute.get("/sessionGetById/:session_id", sessionGetById);



export default sessionRoute;