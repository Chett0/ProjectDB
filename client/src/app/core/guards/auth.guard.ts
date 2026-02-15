import { inject} from '@angular/core';
import { CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserRole } from '../../../types/users/auth';
import { Router } from '@angular/router';

const redirectBasedOnRole = (authService: AuthService, router: Router, state: RouterStateSnapshot) => {
  if(authService.hasRole(UserRole.ADMIN)){
    return router.navigate(['/admin']);
  } else if(authService.hasRole(UserRole.AIRLINE)){
    return router.navigate(['/airlines']);
  } else if(authService.hasRole(UserRole.PASSENGER)){
    return router.navigate(['/passengers']);
  } else {
    
    if(!authService.isAuthenticated()){
      //here the user is not logged in, it needs to save the state for remember the evetual ticket
      AuthService.settingRedirect(state, router);
      return false;
    }

    //fallback for eventual error
    return router.navigate(['/']);
  }
}

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.hasRole(UserRole.ADMIN)){
    return true;
  } else {
    redirectBasedOnRole(authService, router, state);
    return false;
  }
};

export const airlineGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.hasRole(UserRole.AIRLINE)){
    return true;
  }  else {
    redirectBasedOnRole(authService, router, state);
    return false;
  }
};

export const passengerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.hasRole(UserRole.PASSENGER)) {
    return true;
  } else {
    redirectBasedOnRole(authService, router, state);
    return false;
  }
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(!authService.isAuthenticated()){
    return true;
  } else {
    redirectBasedOnRole(authService, router, state);
    return false;
  }
}

export const guestOrPassengerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() || authService.hasRole(UserRole.PASSENGER)) {
    return true;
  } else {
    redirectBasedOnRole(authService, router, state);
  return false;
  }
}
