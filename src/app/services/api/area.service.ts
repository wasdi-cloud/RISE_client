import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConstantsService } from "../constants.service";
import {AreaViewModel} from "../../models/AreaViewModel";

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient,
  ) { }

  /**
   * Get a list of areas
   * @param sSessionId
   * @return
   */
  getAreaList() {
    return this.m_oHttp.get<any>(this.APIURL + '/area/list');
  }

  /**
   * Get an Area by id
   * @param sSessionId
   * @param sId
   * @return
   */

  getAreaById(sId: string) {
    // let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    // urlParams = urlParams + "&" + ;
    return this.m_oHttp.get<any>(this.APIURL + '/area?' + "id=" + sId);
  }

  /**
   * Updates an Area
   * @param sSessionId
   * @param oAreaViewModel
   * @return
   */
  updateArea(oAreaViewModel) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();

    return this.m_oHttp.put<any>(this.APIURL + '/area' + urlParams, oAreaViewModel);
  }

  /**
   * Add an Area
   * @param sSessionId
   * @param oAreaViewModel
   * @return
   */
  addArea(oAreaViewModel:AreaViewModel) {
    // let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();

    return this.m_oHttp.post<any>(this.APIURL + '/area', oAreaViewModel);
  }

  /**
   * Get Users from Area
   * @param sSessionId
   * @param sId
   * @return
   */

  getUsersFromArea(sId) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
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
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
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
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
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
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "id=" + sId;
    return this.m_oHttp.post<any>(this.APIURL + '/area/check_area' + urlParams, oArea);
  }
}
