import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private APIURL: string = '';

  constructor(
    private m_oHttp: HttpClient
  ) { }

  getSubscriptionsList() {
    return this.m_oHttp.get<any>(this.APIURL)
  }

  getSubscriptionById() {

  }

  updateSubscription() {

  }

  getSubscriptionPrice() {

  }

  getSubscriptionTypes() {

  }

  buySubscription() {

  }
}
