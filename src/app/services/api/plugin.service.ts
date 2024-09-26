import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../constants.service";

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private APIURL: string = '';

  constructor(
    private m_oHttp: HttpClient,
    private oConstantsService: ConstantsService,
  ) {
  }

  /**
   * Get a list of Subscriptions per user
   *
   * @param sSessionId
   * @return
   */
  getPluginsList() {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    return this.m_oHttp.get<any>(this.APIURL + '/plugins/list' + urlParams);
  }
}
