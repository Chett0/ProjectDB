import { Router } from "express";
import * as authController from '../controller/auth.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();


/**
 * @swagger
 * /api/v1/auth/passengers/register:
 *   post:
 *     summary: Register a new passenger
 *     description: Creates a new passenger account.
 * 
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPassengerRequest'
 *     responses:
 *       201:
 *         description: Passenger created successfully
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
 *                   example: Passenger created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PassengerDTO'
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     RegisterPassengerRequest:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - surname
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         name:
 *           type: string
 *           example: John
 *         surname:
 *           type: string
 *           example: Doe
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 */

router.post('/passengers/register', authController.registerPassenger);


/**
 * @swagger
 * /api/v1/auth/airlines/register:
 *   post:
 *     summary: Register a new airline
 *     description: |
 *       Creates a new airline account with a random password.
 *       
 *       🔐 **Authorization Required**
 *       - Bearer Token (JWT)
 *       - Role: ADMIN
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterAirlineRequest'
 *     responses:
 *       201:
 *         description: Airline created successfully
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
 *                   example: Airline created successfully
 *                 data:
 *                   $ref: '#/components/schemas/AirlineUserDTO'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     RegisterAirlineRequest:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: airline@example.com
 *         name:
 *           type: string
 *           example: SkyAir
 *         code:
 *           type: string
 *           example: SKY
 */

router.post('/airlines/register', verifyToken, verifyRole(UserRole.ADMIN), authController.registerAirline);



router.post('/admin/register', verifyToken, verifyRole(UserRole.ADMIN), authController.registerAdmin);


/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticates a user and returns access and refresh tokens.  
 *       
 *       🔓 **Public Endpoint** - No authentication required.
 *       
 *       If `mustChangePassword` is `true`, a 303 response is returned indicating that the user must update their password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponseDTO'
 *       303:
 *         description: Password needs to be changed
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
 *                   example: Password need to be changed
 *                 data:
 *                   type: null
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 * 
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 */


router.post('/login', authController.login);


/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Generates a new access token using a refresh token stored in the cookie.  
 *       
 *       🔐 **Requires a valid refresh token cookie** (`jwt`).  
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   $ref: '#/components/schemas/RefreshTokenResponseDTO'
 *       401:
 *         description: Unauthorized - Refresh token not found or invalid
 *       500:
 *         description: Internal server error
 */


router.post('/refresh', authController.refreshToken);

export default router;