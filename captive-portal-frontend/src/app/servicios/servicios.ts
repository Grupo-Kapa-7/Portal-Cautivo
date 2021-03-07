import { Injectable } from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import { Globals } from "../globals";
import { last } from "rxjs/operators";

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
        return this.http.get(this.globals.API_HOST + "/api/portals?filter[where][name]="+portalName);
    }

    getDefaultPortalData()
    {
        return this.http.get(this.globals.API_HOST + "/api/portals?filter[where][default]=true");
    }

    registerGuestUser(firstName: string, lastName: string, email: string, phoneNumber: string = "")
    {
        var data = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobilePhoneNumber: phoneNumber
        }

        return this.http.post(this.globals.API_HOST + "/api/guest-user", data);
    }

    getPortalTerms(id: number)
    {
        return this.http.get(this.globals.API_HOST + '/api/portal-terms/' + id);
    }

    registerMacForGuestUser( macAddress: string, idGuestUser: number)
    {
        var data = {
            macAddress: macAddress,
            guestUserId: idGuestUser
        }

        return this.http.post(this.globals.API_HOST + "/api/guest-mac-addresses", data);
    }

    getGuestUserFromMac(macAddress: string)
    {
        return this.http.get(this.globals.API_HOST + '/api/guest-mac-addresses/' + macAddress + '?filter[include][]=guestUser');
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