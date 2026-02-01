import { Router } from "express";
import * as extraController from '../controller/extra.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

router.get('/airlines/:airlineId/extras', verifyToken, verifyRole(UserRole.PASSENGER), extraController.getExtraByAirlineId);

export default router;