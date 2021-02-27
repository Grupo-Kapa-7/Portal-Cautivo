import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptivePortalComponent } from './captive-portal/captive-portal.component';

const routes: Routes = [
  {path: 'login', component: CaptivePortalComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
