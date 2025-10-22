import { Router } from "express";
import * as airlinesController from '../controller/airline.controller';

const router = Router();

router.get('/me', airlinesController.getAirlineDetails);
router.get('/routes', airlinesController.getAirlineRoutes);
router.post('/routes', airlinesController.createAirlineRoute);

export default router;