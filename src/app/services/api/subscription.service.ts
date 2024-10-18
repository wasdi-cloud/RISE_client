import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { SubscriptionViewModel } from '../../models/SubscriptionViewModel';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  /**
   * Get a list of Subscriptions per user
   *
   * @param sSessionId
   * @param bValid
   * @return
   */
  getSubscriptionsList(bValid: boolean) {
    return this.m_oHttp.get<any>(
      this.APIURL + '/subscriptions/list?valid=' + bValid
    );
  }

  /**
   * Get a Subscription view model by id
   * @param sSessionId
   * @param sId
   * @return
   */
  getSubscriptionById(sId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions?id=' + sId);
  }

  /**
   * Updates a Subscription
   * @param sSessionId
   * @param oSubscriptionViewModel
   * @return
   */
  updateSubscription(oSubscriptionViewModel) {
    return this.m_oHttp.put<any>(
      this.APIURL + '/subscriptions',
      oSubscriptionViewModel
    );
  }

  getSubscriptionPrice(oSubscriptionViewModel: SubscriptionViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/subscriptions/price',
      oSubscriptionViewModel
    );
  }

  /**
   * Get the list of types of subscriptions
   * @param sSessionId
   * @return
   */
  getSubscriptionTypes() {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/types');
  }

  /**
   * Buy Subscription
   * @param sSessionId
   * @param oSubscriptionViewModel
   * @return
   */
  buySubscription(oSubscriptionViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/subscriptions',
      oSubscriptionViewModel,
      {
        observe: 'response',
      }
    );
  }
}
