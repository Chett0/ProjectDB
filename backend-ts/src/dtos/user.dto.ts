import { airlines, passengers, users } from '@prisma/client';
import { PassengerUser } from '../types/passenger.types';


/**
 * @swagger
 * components:
 *  schemas:
 *     UserDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           example: StrongPassword123!
 *       required:
 *         - email
 *         - password
 */

export interface UserDTO {
  email: string;
  password: string;
};

export const toUserDTO = (user : users) : UserDTO => ({
    email: user.email,
    password: user.password
});

/**
 * @swagger
 * components:
 *  schemas:
 *     PassengerDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John
 *         surname:
 *           type: string
 *           example: Doe
 *       required:
 *         - id
 *         - name
 *         - surname
 */

export interface PassengerDTO {
    id: number,
    name: string,
    surname: string
}

export const toPassengerDTO = (passenger : passengers) : PassengerDTO => ({
    id: passenger.id,
    name: passenger.name,
    surname: passenger.surname
});

/**
 * @swagger
 * components:
 *  schemas:
 *     PassengerUserDTO:
 *       allOf:
 *         - $ref: '#/components/schemas/PassengerDTO'
 *         - type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *           required:
 *             - email
 */
export interface PassengerUserDTO extends PassengerDTO{
    email: string
}

export const toPassengerUserDTO = (passenger : PassengerUser) : PassengerUserDTO => ({
    id: passenger.id,
    name: passenger.name,
    surname: passenger.surname,
    email: passenger.users.email
});

export interface AdminDTO {
    email: string
}

export const toAdminDTO = (user : users) : AdminDTO => ({
    email: user.email
});


/**
 * @swagger
 * components:
 *  schemas:
 *    LoginResponseDTO:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - PASSENGER
 *             - AIRLINE
 *           example: PASSENGER
 *         mustChangePassword:
 *           type: boolean
 *           example: false
 *       required:
 *         - accessToken
 *         - refreshToken
 *         - role
 *         - mustChangePassword
 */

export interface LoginResponseDTO {
    accessToken: string,
    refreshToken: string,
    role: string,
    mustChangePassword: boolean
}


/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshTokenResponseDTO:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - PASSENGER
 *             - AIRLINE
 *           example: PASSENGER
 *       required:
 *         - accessToken
 *         - role
 */

export interface RefreshTokenResponseDTO {
    accessToken: string,
    role: string
}



/**
 * @swagger
 * components:
 *  schemas:
 *    AirlineDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: SkyAir
 *         code:
 *           type: string
 *           example: SKY
 *       required:
 *         - id
 *         - name
 *         - code
 */

export interface AirlineDTO {
    id: number, 
    name: string,
    code: string,
}

export const toAirlineDTO = (airline : airlines) : AirlineDTO => ({
    id: airline.id,
    name: airline.name,
    code: airline.code
});



/**
 * @swagger
 * components:
 *  schemas:
 *    AirlineUserDTO:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserDTO'
 *         airline:
 *           $ref: '#/components/schemas/AirlineDTO'
 *       required:
 *         - user
 *         - airline
 */

export interface AirlineUserDTO {
    user: UserDTO,
    airline: AirlineDTO
}

export const toAirlineUserDTO = (user: users, airline: airlines) : AirlineUserDTO => ({
    user: toUserDTO(user),
    airline: toAirlineDTO(airline)
});