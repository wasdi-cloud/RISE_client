import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConstantsService} from '../constants.service';
import {map, Observable} from "rxjs";
import { LayerAnalyzerInputViewModel } from '../../models/LayerAnalyzerInputViewModel';

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

  findAvailableLayers(sMapIds: string, sAreaId: string, iDate: string | number, sPluginId: string):Observable<any> {
    return this.m_oHttp.post<any>(this.APIURL + '/layer/find?area_id=' + sAreaId + '&date=' + iDate+"&plugin_id="+sPluginId,sMapIds);
  }

  areaLayerCount(sAreaId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/layer/available?area_id=' + sAreaId);
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

  /**
   * Fetches the raw attribute data (table data) from GeoServer using WFS GetFeature.
   */
  public getLayerTableDataWFS(sGeoserverUrl: string, sLayerId: string): Observable<any[]> {
    // Convert WMS endpoint to WFS endpoint
    const sWfsUrl = sGeoserverUrl.replace(/\/wms\b/i, '/wfs');

    const oParams = new HttpParams()
      .set('service', 'WFS')
      .set('version', '1.0.0')
      .set('request', 'GetFeature')
      .set('typeName', sLayerId)
      .set('outputFormat', 'application/json');

    return this.m_oHttp.get<any>(sWfsUrl, { params: oParams }).pipe(
      map(oGeoJson => {
        if (oGeoJson && oGeoJson.features) {
          return oGeoJson.features.map((oFeature: any) => oFeature.properties);
        }
        return [];
      })
    );
  }

  analyzer(oInput: LayerAnalyzerInputViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/layer/analyzer', oInput);
  }
}
