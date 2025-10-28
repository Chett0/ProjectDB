import { Router } from 'express';
import airportRoutes from './airport.routes';
import authRoutes from './auth.routes';
import airlinesRoutes from './airline.routes';
import adminRoutes from './admin.routes';
import passengerRoutes from './passenger.routes';
import flightRoutes from './flight.routes';
import { verifyRole, verifyToken } from '../utils/middlewares/auth.middleware';
import { UserRole } from '../types/auth.types';


const router = Router();

router.use('', authRoutes);
router.use('/airlines', verifyToken, verifyRole(UserRole.AIRLINE), airlinesRoutes);
router.use('/passengers', verifyToken, verifyRole(UserRole.PASSENGER), passengerRoutes);
router.use('/admin', verifyToken, verifyRole(UserRole.ADMIN), adminRoutes);
router.use('/airports', airportRoutes);
router.use('/flights', flightRoutes);

export default router;