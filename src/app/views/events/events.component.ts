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
import {RiseCheckboxComponent} from "../../components/rise-checkbox/rise-checkbox.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseTextareaInputComponent} from "../../components/rise-textarea-input/rise-textarea-input.component";
import {RiseDragAndDropComponent} from "../../components/rise-drag-and-drop/rise-drag-and-drop.component";
import {MatFormFieldModule, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {MatInput, MatInputModule} from "@angular/material/input";
import {RiseDateInputComponent} from "../../components/rise-date-input/rise-date-input.component";
import {MatSlideToggle, MatSlideToggleChange, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";

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
    RiseMapComponent,
    RiseCheckboxComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    RiseDragAndDropComponent,
    MatLabel,
    MatDateRangeInput,
    MatHint,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatSuffix,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    RiseDateInputComponent,
    MatSlideToggleModule,
    FormsModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit{
  m_bIsOngoingEvent:boolean=false;
  m_sAreaId:string;
  m_bCreateNewEvent: boolean=false;
  m_aoEvents: EventViewModel[]=[];
  m_aoAreasOfOperations: Array<AreaViewModel>=[];
  m_bPluginsAreValid: boolean;
  m_oEvent: EventViewModel={};
  m_asEventPlugins: { label: string; value: string }[] = [];
  m_asEventPluginsSelected: string[] = [];

  constructor(
    private m_oEventService:EventService,
    private m_oActiveRoute:ActivatedRoute,
    private m_oNotificationServiceDialog:NotificationsDialogsService,
  ) {
  }

  ngOnInit() {
    this.initPlugins()
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
    this.m_bCreateNewEvent=true;
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

  exitCreatingNewEvent() {

  }

  enableEventSubmit() {
    return false;
  }

  enableAOISubmit() {
    return false;
  }

  executeEventSaving() {
    console.log(this.m_oEvent)
    if(this.validateInputs()){
      console.log(this.m_oEvent)
    }
    return '';
  }

  onMapInputChange($event: any) {

  }

  onSelectionChange($event: Array<any>) {

  }

  uploadImage($event: any) {

  }

  uploadDocument($event: any) {

  }

  onSwitchButton(toggel:MatSlideToggleChange) {
    this.m_bIsOngoingEvent=toggel.checked;
  }

  private initPlugins() {
    this.m_asEventPlugins=[
      {label:"Flood",value:"flood"},
      {label:"Fire",value:"fire"},
      {label:"Drought",value:"drought"},
    ]
  }

  private validateInputs() {
    if(!this.m_oEvent){
      return false;
    }
    if(!this.m_oEvent.name)return false;
    if(!this.m_oEvent.description)return false;
    if(!this.m_oEvent.startDate)return false;
    if(!this.m_oEvent.endDate)return false;
    if(!this.m_oEvent.peakDate)return false;
    if(!this.m_oEvent.type)return false;

    return true;
  }
}
