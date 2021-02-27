//Intercepta las llamadas HTTP e inyecta el token en todas las llamadas para autenticar las peticiones

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { 
  timeout,
  retryWhen,
  take,
  concat,
  share,
  delayWhen
} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';


@Injectable()
export class InterceptorHTTP implements HttpInterceptor {
    
    constructor(private cookieService: CookieService)
    {
        
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add a custom header
        const customReq = request.clone({
        headers: request.headers.set('Authorization', this.cookieService.get('token'))
        });

        // pass on the modified request object
        return next.handle(customReq).pipe(timeout(10000));
    }
}