import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  currentYear = new Date().getFullYear();
  loginForm = new FormGroup({
    usernameControl : new FormControl('', [Validators.required]),
    passwordControl : new FormControl('', [Validators.required])
  })

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private spinner: NgxSpinnerService, private servicios: Servicios)
  {

  }

  login()
  {
    if(this.loginForm.valid)
    {
      this.spinner.show();
      console.log("Performing login type:" + this.loginType + " to user : " + this.loginForm.controls.usernameControl.value)
    
      this.servicios.doLogin(this.loginForm.controls.usernameControl.value, this.loginForm.controls.passwordControl.value, this.loginType).subscribe((data:any)=> {
        console.log(data);
        this.spinner.hide();
      },
      (error) => {
        console.log(error);
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
    this.servicios.getMyMip().subscribe((myip: any) => {
      if(myip)
      {
        this.myip = myip.srcip;
      }
    },
    (error) => {
      console.log(error);
    });

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
