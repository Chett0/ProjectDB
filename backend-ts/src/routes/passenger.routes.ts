import { Router } from "express";
import * as passengerController from '../controller/passenger.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/passenger:
 *   put:
 *     summary: Update authenticated passenger profile
 *     description: |
 *       Updates the profile information of the authenticated passenger.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *       
 *       At least one field (`name` or `surname`) must be provided.
 *     tags:
 *       - Passenger
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePassengerRequest'
 *     responses:
 *       200:
 *         description: Passenger updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Passenger updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/PassengerUserDTO'
 *       400:
 *         description: At least one field (name, surname) must be provided
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 * 
  * components:
 *   schemas:
 *     UpdatePassengerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: John
 *         surname:
 *           type: string
 *           example: Doe
 *       description: At least one of the fields must be provided.
 */
router.put('/', passengerController.updatePassenger);

/**
 * @swagger
 * /api/v1/passenger/me:
 *   get:
 *     summary: Get authenticated passenger details
 *     description: |
 *       Retrieves profile information of the authenticated passenger.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *     tags:
 *       - Passenger
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Passenger retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Passenger retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PassengerUserDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 */
router.get('/me', passengerController.getPassengerDetails);

/**
 * @swagger
 * /api/v1/passenger/dashboard_stats:
 *   get:
 *     summary: Get passenger dashboard statistics
 *     description: |
 *       Retrieves dashboard statistics for the authenticated passenger, including total flights,
 *       total flight hours, and total money spent.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *     tags:
 *       - Passenger
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Passenger stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Passenger stats retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PassengerStatsDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard_stats', passengerController.getPassengerStats);

/**
 * @swagger
 * /api/v1/passenger/tickets:
 *   post:
 *     summary: Create a new ticket
 *     description: |
 *       Creates a new ticket for the authenticated passenger.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ticket created successfully
 *                 data:
 *                   $ref: '#/components/schemas/TicketInfoDTO'
 *       400:
 *         description: Missing required fields (flightId, finalCost, seatNumber)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CreateTicketRequest:
 *       type: object
 *       required:
 *         - flightId
 *         - finalCost
 *         - seatNumber
 *       properties:
 *         flightId:
 *           type: integer
 *           example: 1001
 *         seatNumber:
 *           type: string
 *           example: 12A
 *         finalCost:
 *           type: number
 *           format: float
 *           example: 249.99
 *         extrasIds:
 *           type: array
 *           description: Optional list of extra services selected
 *           items:
 *             type: integer
 *           example: [1, 3]
 */
router.post('/tickets', passengerController.createTicket);

/**
 * @swagger
 * /api/v1/passenger/tickets:
 *   get:
 *     summary: Get passenger tickets
 *     description: |
 *       Retrieves all tickets of the authenticated passenger with optional filters and pagination.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tickets per page
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - CONFIRMED
 *             - CANCELLED
 *         description: Filter tickets by booking state
 *       - in: query
 *         name: flightId
 *         schema:
 *           type: integer
 *         description: Filter tickets by flight ID
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tickets retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TicketInfoDTO'
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 */
router.get('/tickets', passengerController.getPassengerTickets);

/**
 * @swagger
 * /api/v1/passenger/seats/{seatId}/session:
 *   post:
 *     summary: Create a seat session for a passenger
 *     description: |
 *       Creates a temporary session/reservation for a specific seat for the authenticated passenger.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: PASSENGER
 *     tags:
 *       - Seats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat to create a session for
 *         example: 501
 *     responses:
 *       200:
 *         description: Seat session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Seat session created successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad Request - Missing or invalid seat ID
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires PASSENGER role
 *       500:
 *         description: Internal server error
 */
router.post('/seats/:seatId/session', passengerController.createSeatSession);

export default router;