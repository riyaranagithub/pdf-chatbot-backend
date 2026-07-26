import { Router } from "express";
import { pdfDelete } from "../controller/pdf/pdfDelete.js";
import { pdfGet } from "../controller/pdf/pdfGet.js";
import { pdfUpload } from "../controller/pdf/pdfUpload.js";
import multer from "multer";

const pdfRoute = Router();  

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

pdfRoute.post("/pdfUpload", upload.single("file"), pdfUpload);
pdfRoute.post("/pdfGet", pdfGet);
pdfRoute.delete("/pdfDelete/:pdf_id", pdfDelete);

export default pdfRoute;