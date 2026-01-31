import { Router } from "express";
import * as userController from '../controller/user.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

router.put('/password', userController.updatePassword);
router.delete('/:email', verifyToken, verifyRole(UserRole.ADMIN), userController.deleteUser);
router.patch('/:email/activate', verifyToken, verifyRole(UserRole.ADMIN), userController.reactivateUser);

export default router;