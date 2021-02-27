import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class Globals {
  
  API_HOST: string = '';


  constructor()
  {
    if(!environment.production)
      this.API_HOST = window.location.protocol + "//" + window.location.hostname + ":8888";
    else
       this.API_HOST = window.location.protocol + "//" + window.location.hostname;
    
  }

  ngOnInit()
  {
    if(!environment.production)
      this.API_HOST = window.location.protocol + "//" + window.location.hostname + ":8888";
    else
       this.API_HOST = window.location.protocol + "//" + window.location.hostname;
    

  }

}