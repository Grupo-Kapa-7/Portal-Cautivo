import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { concat, iif, interval, of, throwError } from 'rxjs';
import { map, mergeMap, retry, retryWhen, take, delay, catchError, concatMap } from 'rxjs/operators';
import { Servicios } from '../servicios/servicios';

interface CaptivePortalTermsData {
  terms: string
}

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
  walledGarden = false;
  ldap = false;
  registered = false;
  portalTermsId = 0;
  portalTerms = "";
  errorMessage = "";
  registeredUser : any;
  loginForm = new FormGroup({
    usernameControl : new FormControl('', [Validators.required]),
    passwordControl : new FormControl('', [Validators.required])
  });

  registrationForm = new FormGroup({
    acceptTerms: new FormControl(false, [Validators.required]),
    firstNameControl : new FormControl('', [Validators.required]),
    lastNameControl : new FormControl('', [Validators.required]),
    emailControl : new FormControl('', [Validators.required, Validators.email]),
    phoneNumberControl : new FormControl('', [Validators.required, Validators.pattern('[0-9]{8}')]),
    macHiddenControl : new FormControl('', [Validators.required]),
    magicHiddenControl: new FormControl('', Validators.required)
  });

  loginThroughForm = new FormGroup({
    acceptTerms: new FormControl(false, [Validators.required]),
    macHiddenControl : new FormControl('', [Validators.required]),
    magicHiddenControl: new FormControl('', Validators.required)
  });

  loginError = false;

  constructor(public dialog: MatDialog, private cookieService: CookieService, private snackBar: MatSnackBar, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private spinner: NgxSpinnerService, private servicios: Servicios)
  {

  }

  viewTerms()
  {
      this.dialog.open(CaptivePortalTermsModal, {
        width: '80%',
        data: {terms: this.portalTerms}
      });
  }

  async checkRegistrationStatus()
  {
    if(this.route.snapshot.queryParams.usermac && this.route.snapshot.queryParams.magic)
    {
      await this.servicios.getGuestUserFromMac(this.route.snapshot.queryParams.usermac).toPromise().then((data:any)=> {
        if(data)
        {
          if(data.guestUser.id)
          {
            console.log("Got user id: " + data.guestUser.id);
            this.registeredUser = data;
            this.registered = true;
          }
        }
      },
      (error)=>{
        if(error.status == 404)
        {
          console.log("User not registered");
        }
      });
      console.log("Checked registration status");
    }
  }

  loginThrough()
  {
    if(this.loginThroughForm.valid)
    {
      this.spinner.show();
      this.loginError = false;
      this.servicios.doFortiGateGuestLogin(this.route.snapshot.queryParams.post, 
        this.route.snapshot.queryParams.magic, 
        this.registeredUser.guestUser.email, 
        this.registeredUser.macAddress).then((result:any) => {
          if(result)
          {
            //Chequear que se haya autenticado
            var retryCount = 0;
            this.servicios.comprobarAutenticacionConFortiGates(this.registeredUser.guestUser.email, this.myip).pipe(
              map((auth:any) => {
                retryCount++;
                console.log(`Retry count ${retryCount}`)
                if(retryCount>5)
                {
                  console.log("Stop retrying, throw exception")
                  return auth;
                }
                else if(auth.status !== 'AUTHENTICATED')
                {
                  console.log("Still not authenticated");
                  throw new Error('NOT AUTHENTICATED');
                }
                else
                  return auth;
              }),
              retryWhen(errors => errors.pipe(take(6),delay(2000), catchError(this.handleError)),
            )).subscribe((auth) => {
                if(auth.status === 'AUTHENTICATED')
                {
                  console.log(auth);
                  this.loginSuccess(this.registeredUser.guestUser.emai, this.registeredUser.guestUser.firstName, this.registeredUser.guestUser.lastName);
                }
                else if(auth.status === 'FAIL')
                {
                  this.loginFailed("No se pudo completar el login");
                }
            },
            (error)=> {
              console.error(error);
              this.loginFailed("No se pudo completar el login");
            });
          }
        },
        (error) => {
          console.log(error);
          if(error.message)
          {
            this.loginFailed("No se pudo completar el login, intente de nuevo en unos momentos");
          }
        });
    }
    else
    {
      this.errorMessage = "Debe aceptar los terminos y condiciones";
      this.loginError = true;
    }
  }

  loginSuccess(username: string, names: string, lastNames: string)
  {
    this.spinner.hide();
    var date = new Date();
    date.setTime(date.getTime()+(10*60*1000));
    this.cookieService.set('username', username, date, "/");
    this.cookieService.set("nombres", names, date, "/");
    this.cookieService.set("apellidos", lastNames, date, "/");
    this.cookieService.set("lastloginstatus", "success", date, "/");
    this.router.navigate(['/loginsuccess']);
  }

  loginFailed(errorMessage: string)
  {
    this.spinner.hide();
    var date = new Date();
    date.setTime(date.getTime()+(10*60*1000));
    this.cookieService.set("lastloginstatus", "unauthorized", date, "/");
    this.loginError = true;
    this.errorMessage = errorMessage;
    this.snackBar.open(errorMessage, 'OK', {duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'});
  }

  handleError(error: HttpErrorResponse)
  {
    console.error(error);
    var date = new Date();
    date.setTime(date.getTime()+(10*60*1000));
    this.cookieService.set("lastloginstatus", "unauthorized",date, "/");
    this.loginError = true;
    this.errorMessage = "No se pudo completar el registro";
    this.snackBar.open("No se pudo completar el registro", 'OK', {duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'});
    return throwError('Intentelo mas tarde');
  }

  registerAndLogin()
  {
    if(this.registrationForm.valid)
    {
      this.loginError = false;
      this.spinner.show();
      console.log("Performing login type:" + this.loginType + " to user : " + this.registrationForm.controls.firstNameControl.value)

      this.servicios.checkUserIsRegistered(this.registrationForm.controls.emailControl.value).subscribe((user:any)=> {
        if(user)
        {
          if(user.email === this.registrationForm.controls.emailControl.value)
          {
            console.log('Usuario ya estaba registrado');
            this.registeredUser = {guestUser : user};
            this.registered = true;
            this.loginThroughForm.controls.acceptTerms.setValue(true);
            this.servicios.registerMacForGuestUser(this.registrationForm.controls.macHiddenControl.value, user.id).subscribe((dataMac :any) => {
              if(dataMac)
              {
                console.log("Usuario y dispositivo registrado correctamente");

                //Hacer post a url de FortiGate
                this.servicios.doFortiGateGuestLogin(this.route.snapshot.queryParams.post, 
                  this.route.snapshot.queryParams.magic, 
                  this.registrationForm.controls.emailControl.value, 
                  this.route.snapshot.queryParams.usermac).then((result:any) => {
                    if(result)
                    {
                      //Chequear que se haya autenticado
                      var retryCount = 0;
                      this.servicios.comprobarAutenticacionConFortiGates(this.registeredUser.guestUser.email, this.myip).pipe(
                        map((auth:any) => {
                          retryCount++;
                          console.log(`Retry count ${retryCount}`)
                          if(retryCount>5)
                          {
                            console.log("Stop retrying, throw exception")
                            return auth;
                          }
                          else if(auth.status !== 'AUTHENTICATED')
                          {
                            console.log("Still not authenticated");
                            throw new Error('NOT AUTHENTICATED');
                          }
                          else
                            return auth;
                        }),
                        retryWhen(errors => errors.pipe(take(6),delay(2000), catchError(this.handleError)),
                      )).subscribe((auth) => {
                          if(auth.status === 'AUTHENTICATED')
                          {
                            this.loginSuccess(this.registeredUser.guestUser.email, this.registeredUser.guestUser.firstName, this.registeredUser.guestUser.lastName);
                          }
                          else if(auth.status === 'FAIL')
                          {
                            this.loginFailed("No se pudo completar el login");
                          }
                      },
                      (error)=> {
                        console.error(error);
                        this.loginFailed("No se pudo completar el login");
                      });
                    }
                  },
                  (error) => {
                    this.spinner.hide();
                    if(error.status)
                    {
                      this.loginFailed("No se pudo completar el registro");
                    }
                  });
              }
            },
            (error) => {
              if(error.status)
              {
                this.loginFailed("No se pudo completar el registro");
              }
            });
          }
        }
        else
        {
          this.servicios.registerGuestUser(this.registrationForm.controls.firstNameControl.value, 
            this.registrationForm.controls.lastNameControl.value, 
            this.registrationForm.controls.emailControl.value,
            this.registrationForm.controls.phoneNumberControl.value).subscribe((data:any) => {
              if(data)
              {
                this.registeredUser = data;
                this.servicios.registerMacForGuestUser(this.registrationForm.controls.macHiddenControl.value, data.id).subscribe((dataMac :any) => {
                  if(dataMac)
                  {
                    console.log("Usuario y dispositivo registrado correctamente");
    
                    //Hacer post a url de FortiGate
                    this.servicios.doFortiGateGuestLogin(this.route.snapshot.queryParams.post, 
                      this.route.snapshot.queryParams.magic, 
                      this.registrationForm.controls.emailControl.value, 
                      this.route.snapshot.queryParams.usermac).then((result:any) => {
                        if(result)
                        {
                          //Chequear que se haya autenticado
                          var retryCount = 0;
                          this.servicios.comprobarAutenticacionConFortiGates(this.registeredUser.guestUser.email, this.myip).pipe(
                            map((auth:any) => {
                              retryCount++;
                              console.log(`Retry count ${retryCount}`)
                              if(retryCount>5)
                              {
                                console.log("Stop retrying, throw exception")
                                return auth;
                              }
                              else if(auth.status !== 'AUTHENTICATED')
                              {
                                console.log("Still not authenticated");
                                throw new Error('NOT AUTHENTICATED');
                              }
                              else
                                return auth;
                            }),
                            retryWhen(errors => errors.pipe(take(6),delay(2000), catchError(this.handleError)),
                          )).subscribe((auth) => {
                              if(auth.status === 'AUTHENTICATED')
                              {
                                this.loginSuccess(this.registeredUser.guestUser.email, this.registeredUser.guestUser.firstName, this.registeredUser.guestUser.lastName);
                              }
                              else if(auth.status === 'FAIL')
                              {
                                this.loginFailed("No se pudo completar el login");
                              }
                          },
                          (error)=> {
                            console.error(error);
                            this.loginFailed("No se pudo completar el login");
                          });
                        }
                      },
                      (error) => {
                        if(error.status)
                        {
                          this.loginFailed("No se pudo completar el registro");
                        }
                      });
                  }
                },
                (error) => {
                  if(error.status)
                  {
                    this.loginFailed("No se pudo completar el registro");
                  }
                })
              }
            },
            (error) =>  {
              if(error.status)
              {
                this.loginFailed("No se pudo completar el registro");
              }
            })
        }
      },
      (error) => {

      });

    }
    else
    {
      console.log("Form not completed. Check captive portal query params")
    }
  }

  login()
  {
    if(this.loginForm.valid && this.loginType == 'ldap')
    {
      this.loginError = false;

      this.spinner.show();
      console.log("Performing login type:" + this.loginType + " to user : " + this.loginForm.controls.usernameControl.value)
    
      this.servicios.doLogin(this.loginForm.controls.usernameControl.value, this.loginForm.controls.passwordControl.value, this.loginType).subscribe((data:any)=> {
        if(data)
        {
          if(data.extra)
          {
            console.log("Login Success for user " + this.loginForm.controls.usernameControl.value);
            this.loginSuccess(data.extra.sAMAccountName, data.extra.givenName, data.extra.sn);
          }
        }
      },
      (error) => {
        console.log(error);
        if(error.status == 401)
        {
          this.loginFailed("Credenciales erroneas");
        }
        else
        {
          this.loginFailed("No se pudo contactar con el servidor de autenticación");
        }
      });
    
    }
    else
    {
      this.loginError = true;
      this.errorMessage = "Por favor llene los campos";
    }
  }

  async ngOnInit(): Promise<void> 
  {

    if(!this.route.snapshot.params.name)
      this.router.navigate(['login/default']);

    this.captivePortalName = this.route.snapshot.params.name;
    this.captivePortalTitle += this.captivePortalName ?? "";

    console.log(this.route.snapshot.params.name);
  
    this.spinner.show();

    await this.servicios.getMyMip().subscribe(async (myip: any) => {
      if(myip)
      {
        this.myip = myip.srcip;
      }
    },
    (error) => {
      console.log(error);
    });

    if(this.captivePortalName != "default")
      await this.servicios.getPortalData(this.captivePortalName).subscribe(async (data: any) => {
        if(data.length > 0 && data != null && data != undefined)
        {
          this.captivePortalTitle = data[0].greeting;
          this.loginType = data[0].type;
          this.portalTermsId = data[0].portalTermsId;
          //Determinar si estamos bajo un portal cautivo de Fortinet u otra marca y si hacemos tambien login hacia el controlador WiFi
          if(this.route.snapshot.queryParams.magic)
          {
            this.registrationForm.controls.magicHiddenControl.setValue(this.route.snapshot.queryParams.magic);
            this.loginThroughForm.controls.magicHiddenControl.setValue(this.route.snapshot.queryParams.magic);
            
            if(this.loginType == 'ldap')
            {
              this.ldap = true;
              console.log("Portal Cautivo configurado como LDAP pero se detecta un walled garden. Proecediendo como ldap y no tipo guest");
            }
            else if(this.loginType == 'guest')
            {
              await this.checkRegistrationStatus();
              this.walledGarden = true;
            }
          }
          else
          {
            if(this.loginType == 'ldap')
            {
              this.ldap = true;
            }
            else if(this.loginType == 'guest')
            {
              await this.checkRegistrationStatus();
              this.walledGarden = true;
              this.registrationForm.controls.magicHiddenControl.setValue("NONE");
              this.loginThroughForm.controls.magicHiddenControl.setValue("NONE");
            }
          }

          if(this.route.snapshot.queryParams.usermac)
          {
            this.registrationForm.controls.macHiddenControl.setValue(this.route.snapshot.queryParams.usermac);
            this.loginThroughForm.controls.macHiddenControl.setValue(this.route.snapshot.queryParams.usermac);
          }

          await this.getPortalTerms();

          this.spinner.hide();
        }
      },
      (error) => {
        console.log(error);
      });
    else
       this.servicios.getDefaultPortalData().subscribe(async (data: any) => {
        if(data.length > 0 && data != null && data != undefined)
        {
          this.captivePortalTitle = data[0].greeting;
          this.loginType = data[0].type;
          this.portalTermsId = data[0].portalTermsId;
          if(this.route.snapshot.queryParams.magic)
          {
            this.registrationForm.controls.magicHiddenControl.setValue(this.route.snapshot.queryParams.magic);
            this.loginThroughForm.controls.magicHiddenControl.setValue(this.route.snapshot.queryParams.magic);

            if(this.loginType == 'ldap')
            {
              this.ldap = true;
              console.log("Portal Cautivo configurado como LDAP pero se detecta un walled garden. Proecediendo como ldap y no tipo guest");
            }
            else if(this.loginType == 'guest')
            {
              await this.checkRegistrationStatus();
              this.walledGarden = true;
            }
          }
          else
          {
            if(this.loginType == 'ldap')
            {
              this.ldap = true;
            }
            else if(this.loginType == 'guest')
            {
              await this.checkRegistrationStatus();
              this.walledGarden = true;
              this.registrationForm.controls.magicHiddenControl.setValue("NONE");
              this.loginThroughForm.controls.magicHiddenControl.setValue("NONE");

            }
          }

          if(this.route.snapshot.queryParams.usermac)
          {
            this.registrationForm.controls.macHiddenControl.setValue(this.route.snapshot.queryParams.usermac);
            this.loginThroughForm.controls.macHiddenControl.setValue(this.route.snapshot.queryParams.usermac);
          }

          await this.getPortalTerms();

          this.spinner.hide();
        }
      },
      (error) => {
        console.log(error);
      });

  }

  async getPortalTerms()
  {
    this.servicios.getPortalTerms(this.portalTermsId).toPromise().then((terms:any) => {
      if(terms)
        this.portalTerms = terms.terms;
    },
    (error) => {
      console.log('Couldnt get portal terms');
    })
  }

}

@Component({
  selector: 'captive-portal-terms',
  templateUrl: './captive-portal-terms.component.html'
})
export class CaptivePortalTermsModal implements OnInit {
  
  constructor(public dialogRef: MatDialogRef<CaptivePortalTermsModal>, @Inject(MAT_DIALOG_DATA) public data: CaptivePortalTermsData)
  {

  }
  
  onNoClick()
  {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    
  }
  
}
