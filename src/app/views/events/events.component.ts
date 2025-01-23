import {Component, OnInit} from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {
  BuyNewSubscriptionComponent
} from "../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseDropdownComponent} from "../../components/rise-dropdown/rise-dropdown.component";
import {TranslateModule} from "@ngx-translate/core";
import {EventViewModel} from "../../models/EventViewModel";
import {MatTooltip} from "@angular/material/tooltip";
import {EventService} from "../../services/api/event.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {ActivatedRoute} from "@angular/router";
import {RiseMapComponent} from "../../components/rise-map/rise-map.component";
import {AreaViewModel} from "../../models/AreaViewModel";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";

@Component({
  selector: 'rise-events',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    BuyNewSubscriptionComponent,
    DatePipe,
    NgForOf,
    NgIf,
    RiseButtonComponent,
    RiseDropdownComponent,
    TranslateModule,
    MatTooltip,
    RiseMapComponent
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit{
  m_sAreaId:string;
  m_bCreateNewEvent: boolean=false;
  m_aoEvents: EventViewModel[]=[];
  m_aoAreasOfOperations: Array<AreaViewModel>=[];



  constructor(
    private m_oEventService:EventService,
    private m_oActiveRoute:ActivatedRoute,
    private m_oNotificationServiceDialog:NotificationsDialogsService,
  ) {
  }

  ngOnInit() {
    this.getActiveAOI()

  }

  private getEventsList() {
    if(FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sAreaId)){
      return;
    }
    this.m_oEventService.getEvents(this.m_sAreaId).subscribe({
      next:(aoEvents)=>{
        this.m_aoEvents=aoEvents;
      },
      error:(oError)=>{
        console.error(oError);
      }
    })
  }
  onCreateNewEvent() {

  }

  editEvent(oEvent: EventViewModel) {

  }
  //todo we might want to add a confirmation
  deleteEvent(oEvent: EventViewModel) {
      if(oEvent){
        this.m_oEventService.deleteEvent(oEvent.id).subscribe({
          next:(oResponse)=>{
            this.getEventsList();
            this.m_oNotificationServiceDialog.openSnackBar("Event deleted successfully","Success","success")
          },
          error:(oError)=>{
            this.m_oNotificationServiceDialog.openSnackBar("Error deleting the event","Error","danger")
          }
        })
      }
  }

  private getActiveAOI() {
    this.m_oActiveRoute.paramMap.subscribe(params => {
      this.m_sAreaId= params.get('aoiId');
      this.getEventsList();
    });
  }

  addNewEvent() {

  }
}
