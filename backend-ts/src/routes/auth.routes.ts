import { Router } from "express";
import * as authController from '../controller/auth.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

router.post('/passengers/register', authController.registerPassenger);
router.post('/airlines/register', verifyToken, verifyRole(UserRole.ADMIN), authController.registerAirline);
router.post('/admin/register', verifyToken, verifyRole(UserRole.ADMIN), authController.registerAdmin);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.put('/users/password', authController.updatePassword);
router.delete('/users/:userId', verifyToken, verifyRole(UserRole.ADMIN), authController.deleteUser);

export default router;