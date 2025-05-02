import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

    /**
   * Add a resource permission
   * @param sSessionId
   * @return
   */
    add(sResourceType: string, sResourceId: string, sUserId: string, sRights: string) {
      let sUrl = "/permission/add?resourceType=" + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId + "&rights=" + sRights;
      return this.m_oHttp.post<any>(this.APIURL + sUrl, "");
    }

    /**
     * Detete a resource permission
     * @param sResourceType 
     * @param sResourceId 
     * @param sUserId 
     * @returns 
     */
    delete(sResourceType: string, sResourceId: string, sUserId: string) {
      let sUrl = "/permission/delete?resourceType=" + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId;
      return this.m_oHttp.delete<any>(this.APIURL + sUrl);
    }
  
}
