import {Injectable} from '@angular/core';
import {ConstantsService} from "../constants.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapParametersService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttpClient: HttpClient
  ) {
  }

  getParameters(sAreaId: string, sMapId: string): Observable<any> {
    return this.m_oHttpClient.get<any>(this.APIURL + '/maps_parameters?area_id=' + sAreaId + '&map_id=' + sMapId);
  }

  addParameters(oMapParametersViewModel: any): Observable<any> {
    return this.m_oHttpClient.post<any>(this.APIURL + '/maps_parameters', oMapParametersViewModel);
  }

  updateParameters(oMapParametersViewModel: any): Observable<any> {
    return this.m_oHttpClient.put<any>(this.APIURL + '/maps_parameters', oMapParametersViewModel);
  }

  deleteParameters(sMapsParametersId: string): Observable<any> {
    return this.m_oHttpClient.delete<any>(this.APIURL + '/maps_parameters?maps_parameters=' + sMapsParametersId);
  }
}
