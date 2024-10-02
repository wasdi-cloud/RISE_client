import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttpClient: HttpClient
  ) { }

  byArea(sAreaId: string) {
    return this.m_oHttpClient.get<any>(this.APIURL + '/map/by_area?area_id=' + sAreaId);
  }
}
