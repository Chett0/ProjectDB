import { Router } from "express";
import * as airportController from '../controller/airport.controller';

const router = Router();

// router.post('/', airportController.createAirport);

router.get('/cities', airportController.getAirportsCities);

export default router;