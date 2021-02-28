import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptivePortalComponent } from './captive-portal/captive-portal.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SuccessLoginComponent } from './success-login/success-login.component';

const routes: Routes = [
  {path: '', component: CaptivePortalComponent},
  {path: 'login', component: CaptivePortalComponent},
  {path: 'login/:name', component: CaptivePortalComponent},
  {path: 'loginsuccess', component: SuccessLoginComponent},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
