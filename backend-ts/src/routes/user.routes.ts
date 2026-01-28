import { Router } from "express";
import * as userController from '../controller/user.controller';
import { verifyRole, verifyToken } from "../utils/middlewares/auth.middleware";
import { UserRole } from "../types/auth.types";

const router = Router();

router.put('/password', userController.updatePassword);
router.delete('/:userId', verifyToken, verifyRole(UserRole.ADMIN), userController.deleteUser);

export default router;