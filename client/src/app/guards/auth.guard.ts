import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../../types/users/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.hasRole(UserRole.ADMIN);
};

export const airlineGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.hasRole(UserRole.AIRLINE);
};

export const passengerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.hasRole(UserRole.PASSENGER);
};