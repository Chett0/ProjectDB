import { Router } from "express";
import * as airportController from '../controller/airports.controller';

const router = Router();

router.post('/', airportController.createAirport);

export default router;