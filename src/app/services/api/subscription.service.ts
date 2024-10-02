import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from "../constants.service";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient,
  ) { }

  /**
   * Get a list of Subscriptions per user
   *
   * @param sSessionId
   * @param bValid
   * @return
   */
  getSubscriptionsList(bValid: boolean) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "valid=" + bValid;
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/list' + urlParams);
  }

  /**
   * Get a Subscription by id
   * @param sSessionId
   * @param sId
   * @return
   */
  getSubscriptionById(sId: string) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions' + urlParams);
  }

  /**
   * Updates a Subscription
   * @param sSessionId
   * @param oSubscriptionViewModel
   * @return
   */
  updateSubscription(oSubscriptionViewModel) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();

    return this.m_oHttp.put<any>(this.APIURL + '/subscriptions' + urlParams, oSubscriptionViewModel);
  }

  /**
   * Get the price of a subscription
   * @param sSessionId
   * @param oSubscriptionViewModel
   * @return
   */
  getSubscriptionPrice(oSubscriptionViewModel) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();

    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions/price' + urlParams, oSubscriptionViewModel);
  }

  /**
   * Get the list of types of subscrptions
   * @param sSessionId
   * @return
   */
  getSubscriptionTypes() {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/types' + urlParams);
  }

  /**
   * Buy Subscription
   * @param sSessionId
   * @param oSubscriptionViewModel
   * @return
   */
  buySubscription(oSubscriptionViewModel) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions' + urlParams, oSubscriptionViewModel);
  }
}
