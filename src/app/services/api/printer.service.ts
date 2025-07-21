import { Injectable } from '@angular/core';
import {ConstantsService} from "../constants.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import * as test from "node:test";

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  storeMap(oPrinterViewModel: any) {
    return this.m_oHttp.post(this.APIURL + '/print/storemap', oPrinterViewModel,{responseType:'text' as 'text'});
  }
  printMap(sUUID: any):Observable<Blob> {
    const sUrl=this.m_oConstantsService.getAPIURL()+`/print?uuid=${encodeURIComponent(sUUID)}`;
    return this.m_oHttp.get(sUrl,{responseType:'blob' as 'blob'});
  }
}
