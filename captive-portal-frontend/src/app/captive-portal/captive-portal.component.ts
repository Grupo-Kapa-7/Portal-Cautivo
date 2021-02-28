import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Servicios } from '../servicios/servicios';

@Component({
  selector: 'app-captive-portal',
  templateUrl: './captive-portal.component.html',
  styleUrls: ['./captive-portal.component.css']
})
export class CaptivePortalComponent implements OnInit {

  captivePortalName = '';
  captivePortalTitle = "";
  myip = 'Obteniendo...';
  loginType = "";
  loginForm = new FormGroup({
    usernameControl : new FormControl('', [Validators.required]),
    passwordControl : new FormControl('', [Validators.required])
  })

  loginError = false;

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private spinner: NgxSpinnerService, private servicios: Servicios)
  {

  }

  login()
  {
    if(this.loginForm.valid)
    {
      this.loginError = false;

      this.spinner.show();
      console.log("Performing login type:" + this.loginType + " to user : " + this.loginForm.controls.usernameControl.value)
    
      this.servicios.doLogin(this.loginForm.controls.usernameControl.value, this.loginForm.controls.passwordControl.value, this.loginType).subscribe((data:any)=> {
        if(data)
        {
          console.log(data);
          this.spinner.hide();
        }
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
        if(error.status == 401)
        {
          this.loginError = true;
          this.snackBar.open(error.statusText + " - Credenciales erroneas", 'OK', {duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'});
        }
      });
    
    }
  }

  ngOnInit(): void 
  {

    if(!this.route.snapshot.params.name)
      this.router.navigate(['login/default']);

    this.captivePortalName = this.route.snapshot.params.name;
    this.captivePortalTitle += this.captivePortalName ?? "";

    console.log(this.route.snapshot.params.name);
  
    this.spinner.show();
    this.servicios.getPortalData(this.captivePortalName).subscribe((data: any) => {
      if(data.length > 0 && data != null && data != undefined)
      {
        this.captivePortalTitle = data[0].greeting;
        this.loginType = data[0].type;
        this.spinner.hide();
      }
    },
    (error) => {
      console.log(error);
      this.spinner.hide();
    });

  }

}
