import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Globals } from "../globals";
import { last } from "rxjs/operators";
import { from } from 'rxjs';

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

    doFortiGateGuestLogin(url: string, magic: string, username: string, password: string)
    {
        // const data = new HttpParams().set('magic', magic).set('username', username).set('password', password);
        // console.log(data.toString());
        // return this.http.post(url, data.toString(), { responseType: 'text', headers: new HttpHeaders().set('Accept', '*/*').set('Content-Type', 'application/x-www-form-urlencoded')});
        const data = new HttpParams().set('magic', magic).set('username', username).set('password', password);
        return fetch(
                url,
                {
                    body: data.toString(),
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    method: 'POST',
                    mode: 'no-cors',
                }
            )
    }

    comprobarAutenticacionConFortiGates(username: string, miIP: string, todosRequeridos: boolean = false)
    {
        return this.http.get(this.globals.API_HOST + '/api/login/getIPAuthenticationStatus?ip=' + miIP + '&username=' + username + '&allRequired=' + todosRequeridos);
    }

    registerMacForGuestUser( macAddress: string, idGuestUser: number)
    {
        var data = {
            macAddress: macAddress,
            guestUserId: idGuestUser
        }

        return this.http.post(this.globals.API_HOST + "/api/guest-mac-addresses", data);
    }

    checkUserIsRegistered(email: string)
    {
        return this.http.get(this.globals.API_HOST + '/api/guest-user/findByEmail/' + email);
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