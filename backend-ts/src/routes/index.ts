import { Router } from 'express';
import airportRoutes from './airport.routes';
import authRoutes from './auth.routes';
import airlinesRoutes from './airline.routes';


const router = Router();

router.use('', authRoutes);
router.use('/airlines', airlinesRoutes);
router.use('/airports', airportRoutes);

export default router;