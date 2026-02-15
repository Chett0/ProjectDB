import { Router } from "express";
import * as airlinesController from '../controller/airline.controller';

const router = Router();

//#region Airline Info

/**
 * @swagger
 * /api/v1/airline/me:
 *   get:
 *     summary: Get authenticated airline details
 *     description: |
 *       Retrieves the profile information of the authenticated airline user.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Airlines
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     responses:
 *       200:
 *         description: Airline retrieved successfully
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
 *                   example: Airline retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/AirlineDTO'
 *       400:
 *         description: Bad Request - Airline ID is missing
 *       404:
 *         description: Not Found - Airline not found
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/me', airlinesController.getAirlineDetails);

/**
 * @swagger
 * /api/v1/airline/dashboard_stats:
 *   get:
 *     summary: Get airline dashboard statistics
 *     description: |
 *       Retrieves dashboard statistics for the authenticated airline, including passenger count,
 *       monthly income, active routes, flights in progress, most in-demand routes, and monthly incomes.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Airlines
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nRoutes
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top most in-demand routes to retrieve
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: current year
 *         description: Year to get monthly incomes
 *     responses:
 *       200:
 *         description: Airline dashboard stats retrieved successfully
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
 *                   example: DashBoard stats retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/AirlineDashBoardDTO'
 *       400:
 *         description: Bad Request - Airline ID missing or invalid query params
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard_stats', airlinesController.getAirlineDashboardStats);

//#endregion

//#region  Routes


/**
 * @swagger
 * /api/v1/airline/routes:
 *   get:
 *     summary: Get all routes of the authenticated airline
 *     description: |
 *       Retrieves all routes operated by the authenticated airline, including departure and arrival airports.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     responses:
 *       200:
 *         description: Airline routes retrieved successfully
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
 *                   example: Airline routes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RouteDTO'
 *       400:
 *         description: Bad Request - Airline ID is missing
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/routes', airlinesController.getAirlineRoutes);

/**
 * @swagger
 * /api/v1/airline/routes:
 *   post:
 *     summary: Create a new route for the authenticated airline
 *     description: |
 *       Creates a new route for the authenticated airline by specifying departure and arrival airport codes.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRouteRequest'
 *     responses:
 *       201:
 *         description: Route created successfully
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
 *                   example: Route created successfully
 *                 data:
 *                   $ref: '#/components/schemas/RouteDTO'
 *       400:
 *         description: Bad Request - Missing required fields (departureAirportCode or arrivalAirportCode)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CreateRouteRequest:
 *       type: object
 *       required:
 *         - departureAirportCode
 *         - arrivalAirportCode
 *       properties:
 *         departureAirportCode:
 *           type: string
 *           example: LHR
 *           description: IATA code of the departure airport
 *         arrivalAirportCode:
 *           type: string
 *           example: CDG
 *           description: IATA code of the arrival airport
 */
router.post('/routes', airlinesController.createAirlineRoute);
router.get("/routes/:id", airlinesController.getAirlineRouteById);

/**
 * @swagger
 * /api/v1/airline/routes/{id}:
 *   delete:
 *     summary: Delete an airline route
 *     description: |
 *       Deletes a specific route of the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the route to delete
 *         example: 101
 *     responses:
 *       200:
 *         description: Airline route deleted successfully
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
 *                   example: Airline route deleted successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad Request - Missing or invalid route ID
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       404:
 *         description: Not Found - Airline route not found
 *       500:
 *         description: Internal server error
 */
router.delete("/routes/:id", airlinesController.deleteAirlineRoute);

//#endregion Routes


//#region  Extras

/**
 * @swagger
 * /api/v1/airline/extras:
 *   post:
 *     summary: Create a new extra for the authenticated airline
 *     description: |
 *       Adds a new extra service (e.g., baggage, meal, priority boarding) for the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Extras
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExtraRequest'
 *     responses:
 *       201:
 *         description: Extra created successfully
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
 *                   example: Extra created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ExtraDTO'
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CreateExtraRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: Extra Legroom
 *           description: Name of the extra service
 *         price:
 *           type: number
 *           format: float
 *           example: 25.50
 *           description: Price of the extra service
 */
router.post('/extras', airlinesController.createExtra);

/**
 * @swagger
 * /api/v1/airline/extras:
 *   get:
 *     summary: Get all extras of the authenticated airline
 *     description: |
 *       Retrieves all extra services (e.g., baggage, meal, priority boarding) created by the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Extras
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     responses:
 *       200:
 *         description: Airline extras retrieved successfully
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
 *                   example: Airline extras retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExtraDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/extras', airlinesController.getAirlineExtras);

/**
 * @swagger
 * /api/v1/airline/extras/{extraId}:
 *   delete:
 *     summary: Delete an extra by ID
 *     description: |
 *       Deletes a specific extra service created by the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Extras
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     parameters:
 *       - in: path
 *         name: extraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the extra to delete
 *         example: 101
 *     responses:
 *       200:
 *         description: Extra deleted successfully
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
 *                   example: Extra deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/ExtraDTO'
 *       400:
 *         description: Bad Request - Missing or invalid extra ID
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       404:
 *         description: Not Found - Extra not found
 *       500:
 *         description: Internal server error
 */
router.delete('/extras/:extraId', airlinesController.deleteExtraById);

//#endregion Extras


//#region Aircrafts

/**
 * @swagger
 * /api/v1/airline/aircrafts:
 *   post:
 *     summary: Create a new aircraft for the authenticated airline
 *     description: |
 *       Adds a new aircraft to the authenticated airline with its model, number of seats, and class configurations.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Aircrafts
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAircraftRequest'
 *     responses:
 *       201:
 *         description: Aircraft created successfully
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
 *                   example: Aircraft created successfully
 *                 data:
 *                   $ref: '#/components/schemas/AircraftDTO'
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CreateAircraftRequest:
 *       type: object
 *       required:
 *         - model
 *         - nSeats
 *         - classes
 *       properties:
 *         model:
 *           type: string
 *           example: Boeing 737
 *           description: Aircraft model
 *         nSeats:
 *           type: integer
 *           example: 180
 *           description: Total number of seats
 *         classes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassDTO'
 *           description: List of classes available on this aircraft
 */
router.post('/aircrafts', airlinesController.createAircraft);

/**
 * @swagger
 * /api/v1/airline/aircrafts:
 *   get:
 *     summary: Get all aircrafts of the authenticated airline
 *     description: |
 *       Retrieves all aircrafts belonging to the authenticated airline, including their classes.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Aircrafts
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     responses:
 *       200:
 *         description: Airline's aircraft retrieved successfully
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
 *                   example: Airline's aircraft retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AircraftDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/aircrafts', airlinesController.getAirlinesAircrafts)

/**
 * @swagger
 * /api/v1/airline/aircrafts/{aircraftId}:
 *   delete:
 *     summary: Delete an aircraft by ID
 *     description: |
 *       Deletes a specific aircraft belonging to the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Aircrafts
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     parameters:
 *       - in: path
 *         name: aircraftId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the aircraft to delete
 *         example: 12
 *     responses:
 *       200:
 *         description: Airline's aircraft deleted successfully
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
 *                   example: Airline's aircraft deleted successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad Request - Missing or invalid aircraft ID
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       404:
 *         description: Not Found - Aircraft not found
 *       500:
 *         description: Internal server error
 */
router.delete('/aircrafts/:aircraftId', airlinesController.deleteAircraft)

/**
 * @swagger
 * /api/v1/airline/aircrafts/{aircraftId}/classes:
 *   get:
 *     summary: Get classes of a specific aircraft
 *     description: |
 *       Retrieves all classes (e.g., Economy, Business) for a specific aircraft belonging to the authenticated airline.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Aircrafts
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     parameters:
 *       - in: path
 *         name: aircraftId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the aircraft
 *         example: 12
 *     responses:
 *       200:
 *         description: Airline's aircraft classes retrieved successfully
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
 *                   example: Airline's aircraft classes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassDTO'
 *       400:
 *         description: Bad Request - Missing or invalid aircraft ID
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       404:
 *         description: Not Found - Aircraft or classes not found
 *       500:
 *         description: Internal server error
 */
router.get('/aircrafts/:aircraftId/classes', airlinesController.getAircraftClasses);

//#endregion Aircrafts


//#region Flights

/**
 * @swagger
 * /api/v1/airline/flights:
 *   get:
 *     summary: Get flights of the authenticated airline
 *     description: |
 *       Retrieves a paginated list of flights operated by the authenticated airline.
 *       Supports optional query filters: search query, maximum price, sort field, and sort order.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Flights
 *     security:
 *       - bearerAuth: [AIRLINE]
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
 *         description: Number of flights per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query to filter flights
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum base price to filter flights
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., departureTime, basePrice)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sorting order (ascending or descending)
 *     responses:
 *       200:
 *         description: Airline's flights retrieved successfully
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
 *                   example: Airline's flights retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     flights:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FlightInfoDTO'
 *                     total:
 *                       type: integer
 *                       example: 125
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 */
router.get('/flights', airlinesController.getAirlineFlights);

/**
 * @swagger
 * /api/v1/airline/flights:
 *   post:
 *     summary: Create a new flight for the authenticated airline
 *     description: |
 *       Creates a new flight for the authenticated airline by specifying route, aircraft, departure/arrival times, and base price.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: AIRLINE
 *     tags:
 *       - Flights
 *     security:
 *       - bearerAuth: [AIRLINE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAirlineFlightRequest'
 *     responses:
 *       201:
 *         description: Airline's flight created successfully
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
 *                   example: Airline's flight created successfully
 *                 data:
 *                   $ref: '#/components/schemas/FlightInfoDTO'
 *       400:
 *         description: Bad Request - Missing required fields or invalid dates/IDs
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires AIRLINE role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     CreateAirlineFlightRequest:
 *       type: object
 *       required:
 *         - routeId
 *         - aircraftId
 *         - departureTime
 *         - arrivalTime
 *         - basePrice
 *       properties:
 *         routeId:
 *           type: integer
 *           example: 12
 *           description: ID of the route for the flight
 *         aircraftId:
 *           type: integer
 *           example: 5
 *           description: ID of the aircraft used for the flight
 *         departureTime:
 *           type: string
 *           format: date-time
 *           example: "2026-03-20T10:30:00Z"
 *           description: Scheduled departure time
 *         arrivalTime:
 *           type: string
 *           format: date-time
 *           example: "2026-03-20T13:45:00Z"
 *           description: Scheduled arrival time
 *         basePrice:
 *           type: number
 *           format: float
 *           example: 350.50
 *           description: Base price of the flight
 */
router.post('/flights', airlinesController.createAirlineFlight);

//#endregion Flights


export default router;