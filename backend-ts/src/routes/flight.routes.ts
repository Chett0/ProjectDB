import { Router } from "express";
import * as flightController from '../controller/flight.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: Search flights
 *     description: |
 *       Searches for available flight journeys based on departure city, arrival city,
 *       departure date, and optional filters.
 *       
 *       🔓 **Public Endpoint** – No authentication required.
 *     tags:
 *       - Flights
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Departure airport city
 *         example: London
 *
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Arrival airport city
 *         example: Paris
 *
 *       - in: query
 *         name: departure_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *         example: 2026-03-01
 *
 *       - in: query
 *         name: n_stops
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 2
 *           default: 1
 *         description: Maximum number of stops
 *
 *       - in: query
 *         name: max_price
 *         required: false
 *         schema:
 *           type: integer
 *           default: 2000
 *         description: Maximum total price filter
 *
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - total_duration
 *             - total_price
 *           default: total_duration
 *         description: Field to sort results by
 *
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: asc
 *         description: Sorting order
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of results per page
 *
 *     responses:
 *       200:
 *         description: Flights retrieved successfully
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
 *                   example: Flight retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     journeys:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JourneysInfoDTO'
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Missing required query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', flightController.searchFlights);

/**
 * @swagger
 * /api/v1/flights/{flightId}/seats:
 *   get:
 *     summary: Get seats for a specific flight
 *     description: |
 *       Retrieves all seats for a given flight, including pricing and class information.
 *       
 *       🔓 Public endpoint (unless protected by middleware at router level).
 *     tags:
 *       - Flights
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the flight
 *         example: 1001
 *     responses:
 *       200:
 *         description: Seats retrieved successfully
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
 *                   example: Seats retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SeatsDTO'
 *       400:
 *         description: Flight ID must be a valid number
 *       500:
 *         description: Internal server error
 */
router.get('/:flightId/seats', flightController.getFlightSeats);

export default router;