import { CanActivateFn, UrlTree, Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { inject } from '@angular/core';

export const chatPageGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.isConnected()) {
    return router.createUrlTree(['/login']);
  } 
  return true;
};