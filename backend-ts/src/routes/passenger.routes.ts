import { Router } from "express";
import * as passengerController from '../controller/passenger.controller';

const router = Router();

router.get('/me', passengerController.getPassengerDetails);

router.post('/tickets', passengerController.createTicket);
router.get('/tickets', passengerController.getPassengerTickets);
router.get('/tickets/:ticketId', passengerController.getPassengerTicketById);

export default router;