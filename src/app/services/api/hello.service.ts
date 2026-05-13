import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConstantsService} from '../constants.service';
import {Observable} from "rxjs";
import { LayerAnalyzerInputViewModel } from '../../models/LayerAnalyzerInputViewModel';
import { ContactMessageViewModel } from '../../models/ContactMessageViewModel';


@Injectable({
  providedIn: 'root'
})
export class HelloService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {
  }

  hello() {
    return this.m_oHttp.get<any>(this.APIURL + '/hello');
  }

  contact(oContactMessage: ContactMessageViewModel): Observable<any> {
    return this.m_oHttp.post<any>(this.APIURL + '/hello/contact', oContactMessage);
  }


}
