import { Router } from "express";
import * as airlinesController from '../controller/airline.controller';

const router = Router();

router.post('/me', airlinesController.getAirlineDetails);

export default router;