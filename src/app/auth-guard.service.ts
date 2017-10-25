import { Injectable }     from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot }    from '@angular/router';
import { SessionService } from "./session.service";



@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {
    // console.log('AuthGuard#canActivate called');
    // let url: string = state.url;


    // return true; //for fast debug TODO: remove

    if(this.session.isLogged){
      return true;
    }

    this.router.navigate(['/login']);

    return false;
  }
}
