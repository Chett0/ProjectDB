import { Router } from "express";
import * as flightController from '../controller/flight.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

// router.post('/', verifyToken, verifyRole(UserRole.AIRLINE), flightController.)

export default router;