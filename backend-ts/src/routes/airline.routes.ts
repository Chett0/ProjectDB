import { Router } from "express";
import * as airlinesController from '../controller/airline.controller';

const router = Router();

router.get('/me', airlinesController.getAirlineDetails);
router.get('/routes', airlinesController.getAirlineRoutes);
router.post('/routes', airlinesController.createAirlineRoute);
router.get("/routes/:id", airlinesController.getAirlineRoute);
router.delete("/routes/:id", airlinesController.deleteAirlineRoute);

export default router;