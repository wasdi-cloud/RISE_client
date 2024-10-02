import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  URL: string = environment.riseUrl;

  APIURL: string = this.URL + '/rise-api/api';

  constructor() { }

  getSessionId() {
    return "";
  }

  /**
   * Get the API url 
   * @returns string
   */
  getAPIURL(): string {
    return this.APIURL;
  }

}
