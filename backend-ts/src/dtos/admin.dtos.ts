/**
 * @swagger
 * components:
 *   schemas:
 *     AdminDashboardDTO:
 *       type: object
 *       properties:
 *         passengersCount:
 *           type: integer
 *           example: 120
 *         airlinesCount:
 *           type: integer
 *           example: 8
 *         flightsCount:
 *           type: integer
 *           example: 342
 *         activeRoutesCount:
 *           type: integer
 *           example: 56
 *       required:
 *         - passengersCount
 *         - airlinesCount
 *         - flightsCount
 *         - activeRoutesCount
 */
export interface AdminDashboardDTO {
    passengersCount: number;
    airlinesCount: number;
    activeRoutesCount: number;
    flightsCount: number;
}