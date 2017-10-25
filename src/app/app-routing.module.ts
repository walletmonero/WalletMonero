import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateComponent} from "./create/create.component";
import {LoginComponent} from "./login/login.component";
import {AccountComponent} from "./account/account.component";
import {AuthGuard} from "./auth-guard.service";

const routes: Routes = [
  { path: 'create', component: CreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: '',
    redirectTo: '/create',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }
