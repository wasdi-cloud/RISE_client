import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../constants.service";

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private APIURL: string = '';

  constructor(private m_oHttp: HttpClient, private oConstantsService: ConstantsService,) {
  }

  /**
   * Get a list of areas
   * @param sSessionId
   * @return
   */
  getAreaList() {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    return this.m_oHttp.get<any>(this.APIURL + '/area/list' + urlParams);
  }

  /**
   * Get an Area by id
   * @param sSessionId
   * @param sId
   * @return
   */

  getAreaById(sId: string) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.get<any>(this.APIURL + '/area' + urlParams);
  }

  /**
   * Updates an Area
   * @param sSessionId
   * @param oAreaViewModel
   * @return
   */
  updateArea(oAreaViewModel) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();

    return this.m_oHttp.put<any>(this.APIURL + '/area' + urlParams, oAreaViewModel);
  }

  /**
   * Add an Area
   * @param sSessionId
   * @param oAreaViewModel
   * @return
   */
  addArea(oAreaViewModel) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();

    return this.m_oHttp.post<any>(this.APIURL + '/area' + urlParams, oAreaViewModel);
  }

  /**
   * Get Users from Area
   * @param sSessionId
   * @param sId
   * @return
   */

  getUsersFromArea(sId) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.get<any>(this.APIURL + '/area/users' + urlParams);
  }

  /**
   * Add Users to  an Area
   * @param sSessionId
   * @param sId
   * @param oUserToAdd
   * @return
   */

  addUserToArea(sId: string, oUserToAdd: any) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.post<any>(this.APIURL + '/area/users' + urlParams, oUserToAdd);

  }

  /**
   * Delete User from an Area
   * @param sSessionId
   * @param sId
   * @param oUserToDelete
   * @return
   */

  deleteUserFromArea(sId: string, oUserToDelete) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.delete<any>(this.APIURL + '/area/users' + urlParams, oUserToDelete);
  }

  /**
   * Check overlapping area
   * @param sSessionId
   * @param sId
   * @param oArea
   * @return
   */

  getOverlappingAreas(sId: string, oArea: any) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.post<any>(this.APIURL + '/area/check_area' + urlParams, oArea);
  }


}
