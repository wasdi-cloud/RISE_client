import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConstantsService} from '../constants.service';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {
  }

  findLayer(sMapId: string, sAreaId: string, iDate: string | number) {
    return this.m_oHttp.get<any>(this.APIURL + '/layer/find?map_id=' + sMapId + '&area_id=' + sAreaId + '&date=' + iDate);
  }

  downloadLayer(sLayerId: string, sFormat: string):Observable<Blob> {
    const params = new HttpParams()
      .set('layer_id', sLayerId)
      .set('format', sFormat);
    return this.m_oHttp.get(this.APIURL + '/layer/download_layer',
      {
        params: params,
        responseType: 'blob' as 'blob'
      });
  }
}
