import { Injectable } from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import { Globals } from "../globals";

@Injectable()
export class Servicios {

    constructor(private http: HttpClient, private globals: Globals)
    {

    }

    getMyMip()
    {
        return this.http.get(this.globals.API_HOST + "/api/login/myip");
    }

    getPortalData(portalName: string)
    {
        return this.http.get(this.globals.API_HOST + "/api/portals?filter=[where][name]="+portalName);
    }

    doLogin(username: string, password: string, type: string)
    {
        var data = {
            "username" : username,
            "password" : password,
            "type" : type
        }

        return this.http.post(this.globals.API_HOST + "/api/login", data);
    }

}