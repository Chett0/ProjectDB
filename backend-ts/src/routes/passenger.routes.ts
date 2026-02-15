import { Router } from "express";
import * as passengerController from '../controller/passenger.controller';

const router = Router();

router.put('/', passengerController.updatePassenger);
router.get('/me', passengerController.getPassengerDetails);
router.get('/me/stats', passengerController.getPassengerStats);

router.post('/tickets', passengerController.createTicket);
router.get('/tickets', passengerController.getPassengerTickets);
//router.get('/tickets/:ticketId', passengerController.getPassengerTicketById);

router.post('/seats/:seatId/session', passengerController.createSeatSession);

export default router;