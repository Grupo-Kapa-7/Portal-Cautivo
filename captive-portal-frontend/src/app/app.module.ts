import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CustomMaterialModule } from './material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CaptivePortalComponent } from './captive-portal/captive-portal.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { Servicios } from './servicios/servicios';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { InterceptorHTTP } from './servicios/httpinterceptor';
import { Globals } from './globals';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuccessLoginComponent } from './success-login/success-login.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    CaptivePortalComponent,
    SuccessLoginComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    FlexLayoutModule,
    CustomMaterialModule
  ],
  providers: [Servicios, CookieService, Globals, HttpClientModule, { provide: HTTP_INTERCEPTORS, useClass: InterceptorHTTP, multi: true }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
