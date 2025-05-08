import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConstantsService} from '../constants.service';
import { WidgetInfoViewModel } from '../../models/WidgetInfoViewModel';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {
  }

  getWidget(sWidgetId: string, iDate: string | number) {
    return this.m_oHttp.get<WidgetInfoViewModel>(this.APIURL + '/widget/bydate?widget=' + sWidgetId + "&date=" + iDate);
  }

  getWidgetList(sWidgetId: string, iDate: string | number) {
    return this.m_oHttp.get<WidgetInfoViewModel[]>(this.APIURL + '/widget/listbydate?widget=' + sWidgetId + "&date=" + iDate);
  }
}
