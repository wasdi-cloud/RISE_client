import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../constants.service";

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient,
  ) {
  }

  /**
   * Get a list of Subscriptions per user
   *
   * @param sSessionId
   * @return
   */
  getPluginsList() {
    return this.m_oHttp.get<any>(this.APIURL + '/plugins/list');
  }
}
