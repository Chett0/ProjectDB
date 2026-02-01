import { Router } from "express";
import * as flightController from '../controller/flight.controller';import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

router.post('/', verifyToken, verifyRole(UserRole.AIRLINE), flightController.createFlight);
router.get('/', flightController.searchFlights);
router.get('/:flightId/seats', flightController.getFlightSeats);

export default router;