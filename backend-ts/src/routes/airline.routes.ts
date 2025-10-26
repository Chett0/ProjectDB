import { Router } from "express";
import * as airlinesController from '../controller/airline.controller';

const router = Router();

router.get('/me', airlinesController.getAirlineDetails);
router.get('/dashboard-stats', airlinesController.getAirlineDashboardStats)

router.get('/routes', airlinesController.getAirlineRoutes);
router.post('/routes', airlinesController.createAirlineRoute);
router.get("/routes/:id", airlinesController.getAirlineRoute);
router.delete("/routes/:id", airlinesController.deleteAirlineRoute);

router.post('/extras', airlinesController.createExtra);
router.get('/extras', airlinesController.getAirlineExtras);
router.delete('/extras/:extrasId', airlinesController.deleteExtraById);

router.post('/aircrafts', airlinesController.createAircraft);

router.post('/flights', airlinesController.createFlight)


export default router;