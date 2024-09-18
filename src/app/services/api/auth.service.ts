import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/models/user';
import { UserCredentials } from '../../shared/models/user-credentials';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private APIURL: string = '';

  private AUTHURL: string = '';

  constructor(
    private m_oHttp: HttpClient
  ) { }

  loginUser(oCredentials: UserCredentials) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/login', oCredentials)
  }

  registerUser() { }

  validateUserCredentials() { }
}
