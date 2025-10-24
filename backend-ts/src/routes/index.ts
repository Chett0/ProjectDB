import { Router } from 'express';
import airportRoutes from './airport.routes';
import authRoutes from './auth.routes';
import airlinesRoutes from './airline.routes';
import passengerRoutes from './passenger.routes';
import { verifyRole, verifyToken } from '../utils/middlewares/auth.middleware';
import { UserRole } from '../types/auth.types';


const router = Router();

router.use('', authRoutes);
router.use('/airlines', verifyToken, verifyRole(UserRole.AIRLINE), airlinesRoutes);
router.use('/airports', airportRoutes);
router.use('/passenger', verifyToken, verifyRole(UserRole.PASSENGER), passengerRoutes);

export default router;