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
   * Get the list of available plugins
   *
   * @param sSessionId
   * @return
   */
  getPluginsList() {
    return this.m_oHttp.get<any>(this.APIURL + '/plugins/list');
  }

  /**
   * Get the list of plugins associated to an area
   * @param sAreaId Area ID
   * @returns 
   */
  getPluginsByArea(sAreaId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/plugins/by_area?area_id=' + sAreaId);
  }  
  
}
