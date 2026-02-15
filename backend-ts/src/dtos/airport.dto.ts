import { airports } from '@prisma/client';

/**
 * @swagger
 * components:
 *   schemas:
 *     AirportDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Heathrow Airport
 *         code:
 *           type: string
 *           example: LHR
 *         city:
 *           type: string
 *           example: London
 *         country:
 *           type: string
 *           example: United Kingdom
 *       required:
 *         - id
 *         - name
 *         - code
 *         - city
 *         - country
 */
export interface AirportDTO {
    id: number;
    name: string;
    code: string;
    city: string;
    country: string;
}

export const toAirportDTO = (airport: airports): AirportDTO => ({
    id: airport.id,
    name: airport.name,
    code: airport.iata,
    city: airport.city,
    country: airport.country
})

/**
 * @swagger
 * components:
 *   schemas:
 *     CityDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: New York
 *       required:
 *         - name
 */

export interface CityDTO {
    name: string;
}

export const toCityDTO = (city: { city: string }): CityDTO => ({
    name: city.city
});