import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserRole } from '../../../types/users/auth';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if(authService.hasRole(UserRole.ADMIN))
    return true;

  AuthService.settingRedirect(state);
  return false;
};

export const airlineGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if(authService.hasRole(UserRole.AIRLINE))
    return true;
  AuthService.settingRedirect(state);
  return false;
};

export const passengerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if(authService.hasRole(UserRole.PASSENGER))
    return true;
  AuthService.settingRedirect(state);
  return false;
};


