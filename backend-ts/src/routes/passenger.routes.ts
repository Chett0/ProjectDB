import { Router } from "express";
import * as passengerController from '../controller/passenger.controller';

const router = Router();

router.get('/me', passengerController.getPassengerDetails);

router.post('/tickets')

export default router;