import { Router } from "express";
import * as airportController from '../controller/airport.controller';

const router = Router();

router.post('/', airportController.createAirport);

export default router;