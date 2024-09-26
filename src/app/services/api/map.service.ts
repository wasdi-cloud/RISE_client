import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private APIURL: string = '';

  constructor(
    private m_oHttpClient: HttpClient
  ) { }

  byArea(sAreaId: string) {
    return this.m_oHttpClient.get<any>(this.APIURL + '/map/by_area?area_id=' + sAreaId);
  }
}
