import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Servicios } from '../servicios/servicios';

@Component({
  selector: 'app-success-login',
  templateUrl: './success-login.component.html',
  styleUrls: ['./success-login.component.css']
})
export class SuccessLoginComponent implements OnInit {

  nombres = "";
  apellidos = "";

  constructor(private router: Router, private cookieService: CookieService, private servicios: Servicios, private spinner: NgxSpinnerService)
  { 
    if(this.cookieService.get("lastloginstatus") === "success")
    {
      this.nombres = cookieService.get('nombres');
      this.apellidos = cookieService.get("apellidos");
      setTimeout(() => {
        window.location.href = 'http://www.cenosa.hn';
      }, 5000);
    }
    else
    {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
  }

}
