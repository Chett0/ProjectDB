import { Router } from "express";
import * as adminController from '../controller/admin.controller';

const router = Router();

router.get('/dashboard-stats', adminController.getAdminDashboardStats);

export default router;