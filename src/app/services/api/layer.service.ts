import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  findLayer(sMapId: string, sAreaId: string, iDate: string | number) {
    return this.m_oHttp.get<any>(this.APIURL + '/layer/find?map_id=' + sMapId + '&area_id=' + sAreaId + '&date=' + iDate);
  }
}
