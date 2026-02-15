import { Router } from "express";
import * as extraController from '../controller/extra.controller';
import * as airportController from '../controller/airport.controller';
import * as adminController from '../controller/admin.controller';
import { verify } from "crypto";
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

/**
 * @swagger
 * /api/v1/airlines/{airlineId}/extras:
 *   get:
 *     summary: Get airline extras by airline ID
 *     description: |
 *      Retrieves all active extras offered by a specific airline.
 * 
 *      🔓 Public Endpoint - No authentication required.      
 * 
 *     tags:
 *       - Airlines
 *     parameters:
 *       - in: path
 *         name: airlineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the airline
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
 *       400:
 *         description: Missing or invalid airline ID parameter
 *       500:
 *         description: Internal server error
 */

router.get('/airlines/:airlineId/extras', extraController.getExtraByAirlineId);

/**
 * @swagger
 * /api/v1/airlines/{airlineId}/aircrafts/{aircraftId}/classes:
 *   get:
 *     summary: Get aircraft classes by aircraft ID
 *     description: |
 *      Retrieves all active seat classes for a specific aircraft belonging to an airline.
 * 
 *      🔓 Public Endpoint - No authentication required.
 * 
 *     tags:
 *       - Airlines
 *     parameters:
 *       - in: path
 *         name: airlineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the airline
 *       - in: path
 *         name: aircraftId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the aircraft
 *     responses:
 *       200:
 *         description: Airline classes retrieved successfully
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
 *                   example: Airline classes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassDTO'
 *       400:
 *         description: Missing or invalid aircraft ID parameter
 *       500:
 *         description: Internal server error
 */
router.get('/airlines/:airlineId/aircrafts/:aircraftId/classes', extraController.getClassesByAircraftId);

/**
 * @swagger
 * /api/v1/cities:
 *   get:
 *     summary: Get all airport cities
 *     description: |
 *      Retrieves a distinct, alphabetically ordered list of cities where airports are located.
 * 
 *      🔓 Public Endpoint - No authentication required.
 * 
 *     tags: [Airports]
 *     operationId: getAirportsCities
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
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
 *                   example: Cities retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CityDTO'
 *       500:
 *         description: Internal server error
 */
router.get('/cities', airportController.getAirportsCities);


/**
 * @swagger
 * /api/v1/admin/dashboard_stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: |
 *       Retrieves aggregated statistics for the admin dashboard.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: ADMIN
 *       
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: [ADMIN]
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
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
 *                   $ref: '#/components/schemas/AdminDashboardDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Internal server error
 */
router.get('/admin/dashboard_stats', verifyToken, verifyRole(UserRole.ADMIN), adminController.getAdminDashboardStats);

/**
 * @swagger
 * /api/v1/airlines:
 *   get:
 *     summary: Get all airlines
 *     description: |
 *       Retrieves a list of all active airlines.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: ADMIN
 *       
 *     tags:
 *       - Airlines
 *     security:
 *       - bearerAuth: [ADMIN]
 *     responses:
 *       200:
 *         description: Airlines retrieved successfully
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
 *                   example: Airlines retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AirlineDTO'
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Internal server error
 */
router.get('/airlines', verifyToken, verifyRole(UserRole.ADMIN), adminController.getAllAirlines);

export default router;