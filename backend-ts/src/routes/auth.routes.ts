import { Router } from "express";
import * as authController from '../controller/auth.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";

const router = Router();

router.post('/passengers/register', authController.registerPassenger);
router.post('/airlines/register', authController.registerAirline);
router.post('/admin/register', authController.registerAdmin);
router.post('/login', authController.login);
// router.post('/refresh');
router.put('/users/password', authController.updatePassword);

export default router;