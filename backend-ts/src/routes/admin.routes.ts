import { Router } from "express";
import * as adminController from '../controller/admin.controller';

const router = Router();

router.get('/dashboard-stats', adminController.getAdminDashboardStats);
router.get('/airlines', adminController.getAllAirlines);

export default router;