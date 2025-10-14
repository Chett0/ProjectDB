import { Router } from 'express';
import airportRoutes from './airport.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/airports', airportRoutes);
router.use('', authRoutes)

export default router;