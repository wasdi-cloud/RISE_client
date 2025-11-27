import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root',
})
export class MapAPIService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttpClient: HttpClient
  ) {}

  /**
   * Get all the maps enabled in an area
   * @param sAreaId Area Id
   * @returns 
   */
  byArea(sAreaId: string) {
    return this.m_oHttpClient.get<any>(
      this.APIURL + '/map/by_area?area_id=' + sAreaId
    );
  }

  /**
   * Get all the maps enabled for a plugin
   * @param sPluginId Plugin Id
   * @returns 
   */
  byPluginId(sPluginId: string) {
    return this.m_oHttpClient.get<any>(
      this.APIURL + '/map/by_plugin?plugin_id=' + sPluginId
    );
  }

}
