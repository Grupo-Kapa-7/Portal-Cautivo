import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationStart, Router, RoutesRecognized } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotFoundComponent } from './not-found/not-found.component';
import { Servicios } from './servicios/servicios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GK7 Captive Portal';

  currentYear = new Date().getFullYear();
  captivePortalName = '';
  captivePortalTitle = "";
  myip = 'Obteniendo...';

  constructor(private servicios: Servicios, private router: Router, private activatedRoute: ActivatedRoute, private spinner: NgxSpinnerService)
  {
    router.events.subscribe(event => {
      if(event instanceof RoutesRecognized)
      {
        console.log(event);

        if(event.url.startsWith('/login/'))
        {
          this.captivePortalName = event.url.split('/login/')[1];
          if(this.captivePortalName != "")
          {
            this.servicios.getPortalData(this.captivePortalName).subscribe((data: any) => {
              if(data.length > 0 && data != null && data != undefined)
              {
                this.captivePortalTitle = data[0].greeting;
              }
            },
            (error) => {
              console.log(error);
            });
          }
        }
      }
      else if(event instanceof ActivationStart)
      {
        console.log(event);
        if(event.snapshot.component instanceof NotFoundComponent)
        {
          this.captivePortalName = "";
          this.captivePortalTitle = "";
        }
      }
    });
  }

  ngOnInit()
  {
    console.log(this.router.url);
    this.servicios.getMyMip().subscribe((myip: any) => {
      if(myip)
      {
        this.myip = myip.srcip;
      }
    },
    (error) => {
      console.log(error);
    });

  }
}
