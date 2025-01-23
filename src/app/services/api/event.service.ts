import { Injectable } from '@angular/core';
import {ConstantsService} from "../constants.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {EventViewModel} from "../../models/EventViewModel";

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  getEvents(sAreaId:string):Observable<EventViewModel[]>{
    return this.m_oHttp.get<EventViewModel[]>(this.APIURL+'/event/list?areaId='+sAreaId)
  }
  deleteEvent(sEventId:string):Observable<any>{
    return this.m_oHttp.delete<any>(this.APIURL+'/event/delete?eventId='+sEventId)
  }
  addEvent(sAreaId:string,oEvent:EventViewModel):Observable<EventViewModel>{
    return this.m_oHttp.post<EventViewModel>(this.APIURL+'/event/add?areaId='+sAreaId,oEvent)
  }
  updateEvent(oEvent:EventViewModel):Observable<EventViewModel>{
    return this.m_oHttp.put<EventViewModel>(this.APIURL+'/event/update',oEvent)
  }
}
