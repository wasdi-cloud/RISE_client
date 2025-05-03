import {Component, OnInit} from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {DatePipe, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {TranslateModule} from "@ngx-translate/core";
import {EventViewModel} from "../../models/EventViewModel";
import {MatTooltip} from "@angular/material/tooltip";
import {EventService} from "../../services/api/event.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {ActivatedRoute, Router} from "@angular/router";
import {RiseMapComponent} from "../../components/rise-map/rise-map.component";
import {AreaViewModel} from "../../models/AreaViewModel";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseTextareaInputComponent} from "../../components/rise-textarea-input/rise-textarea-input.component";
import {RiseDragAndDropComponent} from "../../components/rise-drag-and-drop/rise-drag-and-drop.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {MatInputModule} from "@angular/material/input";
import {RiseDateInputComponent} from "../../components/rise-date-input/rise-date-input.component";
import {MatSlideToggleChange, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {geojsonToWKT} from "@terraformer/wkt";
import {MapService} from "../../services/map.service";
import {EventType} from "../../models/EventType";
import { ConstantsService } from '../../services/constants.service';
import { AttachmentService } from '../../services/api/attachment.service';
import { AreaService } from '../../services/api/area.service';

@Component({
  selector: 'rise-events',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    DatePipe,
    NgForOf,
    NgIf,
    RiseButtonComponent,
    TranslateModule,
    MatTooltip,
    RiseMapComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    RiseDragAndDropComponent,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    RiseDateInputComponent,
    MatSlideToggleModule,
    FormsModule,
    TitleCasePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  m_sSortField: string = '';
  m_sSortDirection: 'asc' | 'desc' | '' = '';
  m_aoOriginalEvents: EventViewModel[] = []; // Backup the original order
  m_bIsOngoingEvent: boolean = false;
  m_sAreaId: string;
  m_bCreateNewEvent: boolean = false;
  m_bUpdatingEvent: boolean = false;
  m_aoEvents: EventViewModel[] = [];
  m_oEvent: EventViewModel = {};
  m_sStartDate: any;
  m_sPeakDate: any;
  m_sEndDate: any;
  m_aoEventTypes: { name: string; value: EventType }[];
  m_sEventNameError: string ="";
  m_bEventNameIsValid:boolean=true;
  m_bIsDateInvalid: boolean=false;
  m_sDateErrorText: string="";
  m_sUploadDocName: any;
  m_oUploadDocFile: any;
  m_sUploadImageName: any;
  m_oUploadImageFile: any;
  m_oArea: AreaViewModel = null;
  m_sAreaName: string = null;


  constructor(
    private m_oEventService: EventService,
    private m_oActiveRoute: ActivatedRoute,
    private m_oMapService: MapService,
    private m_oRouter: Router,
    private m_oNotificationServiceDialog: NotificationsDialogsService,
    private m_oConstantsService: ConstantsService,
    private m_oAttachmentService: AttachmentService,
    private m_oAreaService: AreaService
  ) {
  }

  ngOnInit() {
    this.getEventTypes()
    this.getActiveAOI()

  }

  onCreateNewEvent() {
    this.m_bCreateNewEvent = true;
  }
  getEventTypes(){
    this.m_aoEventTypes= Object.values(EventType).map(type => ({
      name: type.toLowerCase().replace('_', ' '), // Formatting name for display
      value: type
    }));


  }
  editEvent(oEvent: EventViewModel) {
    this.m_oEvent=oEvent;
    this.m_sStartDate=this.formatEpochToDate(this.m_oEvent.startDate*1000);
    this.m_sPeakDate=this.formatEpochToDate(this.m_oEvent.peakDate*1000);
    this.m_sEndDate=this.formatEpochToDate(this.m_oEvent.endDate*1000);

    this.m_bUpdatingEvent=true;
  }
//todo we might want to add a confirmation
  deleteEvent(oEvent: EventViewModel) {
    if (oEvent) {
      this.m_oEventService.deleteEvent(oEvent.id).subscribe({
        next: (oResponse) => {
          this.getEventsList();
          this.m_oNotificationServiceDialog.openSnackBar("Event deleted successfully", "Success", "success")
        },
        error: (oError) => {
          this.m_oNotificationServiceDialog.openSnackBar("Error deleting the event", "Error", "danger")
        }
      })
    }
  }


  updateEvent(){
    this.m_oEventService.updateEvent(this.m_oEvent).subscribe(
      {
        next: (oResponse) => {
          this.m_oNotificationServiceDialog.openSnackBar(
            "Event Updated Successfully",
            "Success",
            "success"
          )
          this.exitCreatingNewEvent();

        },
        error: (oError) => {
          this.m_oNotificationServiceDialog.openSnackBar(
            "Event was not updated",
            "Error",
            "danger"
          )
        }
      }
    )
  }

  canUserWriteArea() {
    let oUser = this.m_oConstantsService.getUser();
    let oArea = this.m_oConstantsService.getActiveAOI();

    if (oUser == null || oArea == null) {
      return false;
    }

    if (oUser.organizationId == oArea.organizationId) {
      return true;
    }

    return false;
  }

  addNewEvent() {
    this.m_oEventService.addEvent(this.m_sAreaId, this.m_oEvent).subscribe(
      {
        next: (oResponse) => {
          this.m_oNotificationServiceDialog.openSnackBar(
            "Event Added Successfully",
            "Success",
            "success"
          )
          this.exitCreatingNewEvent();

        },
        error: (oError) => {
          this.m_oNotificationServiceDialog.openSnackBar(
            "Event was not added",
            "Error",
            "danger"
          )
        }
      }
    )
  }

  exitCreatingNewEvent() {
    this.m_oEvent = {};
    this.m_bCreateNewEvent = false;
    this.m_bUpdatingEvent = false;
    this.getEventsList();
  }

  enableEventSubmit() {
    return false;
  }

  enableAOISubmit() {
    return false;
  }

  executeEventSaving() {
    if (this.validateEvent()) {
      if(this.m_bCreateNewEvent){

        // this.m_oEvent.startDate /= 1000;
        // this.m_oEvent.peakDate /= 1000;
        // this.m_oEvent.endDate /= 1000;
    
        this.addNewEvent()
      }
      else if (this.m_bUpdatingEvent){
        this.updateEvent();
      }

    }
  }

  onMapInputChange(shapeInfo: any) {
    if (shapeInfo) {
      if (shapeInfo.type === 'circle') {
        // Store circle information as before
        let areaInfo = {
          type: 'circle',
          center: {
            lat: shapeInfo.center.lat,
            lng: shapeInfo.center.lng,
          },
          radius: shapeInfo.radius,
          area: shapeInfo.area,
        };
        // Convert circle to WKT (approximated as a polygon with 64 points)
        this.m_oEvent.markerCoordinates='POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
        this.m_oEvent.bbox = this.m_oMapService.convertCircleToWKT(
          shapeInfo.center,
          shapeInfo.radius
        );
      } else if (shapeInfo.type === 'polygon') {
        // Store polygon information as before
        let areaInfo = {
          type: 'polygon',
          points: shapeInfo.points,
          area: shapeInfo.area,
          geoJson: shapeInfo.geoJson,
          center: shapeInfo.center,
        };
        // Convert polygon to WKT
        this.m_oEvent.bbox = geojsonToWKT(shapeInfo.geoJson);
        this.m_oEvent.markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      }
    }
  }

  uploadImage() {

    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUploadImageFile)) {
      console.log("Please upload a file");
      return false;
    }

    const oFormData = new FormData();
    oFormData.append("file", this.m_oUploadImageFile);        

    this.m_oAttachmentService.upload("event_images", this.m_oEvent.id, this.m_sUploadImageName, oFormData).subscribe({
      next: oResponse => {
        console.log("Image uploaded successfully", oResponse);
        this.m_oUploadImageFile = null;
        this.m_sUploadImageName = "";
      },
      error: oError => {
        console.log("Error ", oError);
      }
    });

    return true;
  }

  setImageFile(oEvent: any) {
    this.m_sUploadImageName = oEvent.file.name;
    this.m_oUploadImageFile = oEvent.file;
  }

  uploadDocument() {
    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUploadDocFile)) {
      console.log("Please upload a file");
      return false;
    }

    const oFormData = new FormData();
    oFormData.append("file", this.m_oUploadDocFile);        

    this.m_oAttachmentService.upload("event_docs", this.m_oEvent.id, this.m_sUploadDocName, oFormData).subscribe({
      next: oResponse => {
        console.log("Doc uploaded successfully", oResponse);
        this.m_oUploadDocFile = null;
        this.m_sUploadDocName = "";
      },
      error: oError => {
        console.log("Error ", oError);
      }
    });

    return true;    
  }

  setDocumentFile(oEvent: any) {
    this.m_sUploadDocName = oEvent.file.name;
    this.m_oUploadDocFile = oEvent.file;
  }

  onSwitchOnGoingButton(toggel: MatSlideToggleChange) {
    this.m_oEvent.onGoing = toggel.checked;
  }
  onSwitchPublicButton(toggel: MatSlideToggleChange) {
    this.m_oEvent.publicEvent = toggel.checked;
  }

  // Convert epoch time to 'mm/dd/yyyy' string
  formatEpochToDate(epoch: number): string {
    if (!epoch) return '';

    const date = new Date(epoch); // Interpret the epoch timestamp

    // Use UTC methods to ensure consistent output
    const yyyy = date.getUTCFullYear();
    const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dd = date.getUTCDate().toString().padStart(2, '0');

    // return `${mm}-${dd}-${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  }

  // Convert mm/dd/yyyy string to epoch timestamp
  convertDateToEpoch(dateString: string): number | null {
    const [yyyy, mm, dd] = dateString.split('-').map(Number);
    if (!this.isValidDate(mm, dd, yyyy)) return null;
    // Use UTC to avoid timezone shifts
    const date = new Date(Date.UTC(yyyy, mm - 1, dd));

    return date.getTime(); // Get the epoch in milliseconds
  }

  // Handle date input changes
  onDateChange(sDateString: string, sProperty: 'startDate' | 'endDate' | 'peakDate'): void {
    const oEpoch = this.convertDateToEpoch(sDateString);

    if (oEpoch !== null) {
      this.m_oEvent[sProperty] = oEpoch/1000; // Dynamically update the specified property
    } else {
      console.warn(`Invalid date format for ${sProperty}. Expected mm-dd-yyyy.`);
    }
  }

  // Validate the date
  isValidDate(mm: number, dd: number, yyyy: number): boolean {
    if (!mm || !dd || !yyyy) return false;
    const date = new Date(yyyy, mm - 1, dd);
    return (
      date.getFullYear() === yyyy &&
      date.getMonth() === mm - 1 &&
      date.getDate() === dd
    );
  }

  // Handle user input: validate and convert to epoch



  private getEventsList() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sAreaId)) {
      return;
    }

    this.m_oEventService.getEvents(this.m_sAreaId).subscribe({
      next: (aoEvents) => {
        this.m_aoEvents = aoEvents;
        this.m_aoOriginalEvents = [...this.m_aoEvents];

      },
      error: (oError) => {
        console.error(oError);
      }
    })
  }
  sortBy(sField: string) {
    if (this.m_sSortField !== sField) {
      // New field clicked, start with ascending
      this.m_sSortField = sField;
      this.m_sSortDirection = 'asc';
    } else {
      // Same field clicked again, toggle direction
      if (this.m_sSortDirection === 'asc') {
        this.m_sSortDirection = 'desc';
      } else if (this.m_sSortDirection === 'desc') {
        // After descending, reset to original
        this.m_sSortField = '';
        this.m_sSortDirection = '';
        this.m_aoEvents = [...this.m_aoOriginalEvents];
        return;
      }
    }

    this.m_aoEvents.sort((a, b) => {
      let valueA = a[sField];
      let valueB = b[sField];

      // If dealing with timestamp, multiply to get milliseconds
      if (typeof valueA === 'number') {
        valueA = valueA * 1000;
        valueB = valueB * 1000;
      }

      if (this.m_sSortDirection === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  private getActiveAOI() {
    this.m_oActiveRoute.paramMap.subscribe(params => {
      this.m_sAreaId = params.get('aoiId');

      this.m_oAreaService.getAreaById(this.m_sAreaId).subscribe({
        next: (oArea: AreaViewModel) => {
          this.m_oArea = oArea;
          this.m_oMapService.flyToMonitorBounds(oArea.bbox);
          this.m_sAreaName = oArea.name;
        }
      });

      this.getEventsList();
    });
  }

  enableSubmit() {
    if (!this.m_oEvent) {
      return false;
    }
    if (
      !this.m_oEvent.name ||
      !this.m_oEvent.startDate ||
      !this.m_oEvent.endDate ||
      !this.m_oEvent.peakDate ||
      !this.m_oEvent.type
    ){
      return false;
    }
    return true;
  }

  getNameOfEventType(type: EventType): string {
    const nameMap: { [key in EventType]: string } = {
      [EventType.FLOOD]: 'Flood',
      [EventType.DROUGHT]: 'Drought',
      [EventType.CONFLICT]: 'Conflict',
      [EventType.EARTHQUAKE]: 'Earthquake',
      [EventType.TSUNAMI]: 'Tsunami',
      [EventType.INDUSTRIAL_ACCIDENT]: 'Industrial Accident',
      [EventType.LANDSLIDE]: 'Landslide',
      [EventType.OTHER]: 'Other'
    };

    return nameMap[type] || 'Unknown'; // Default to "Unknown" if type is undefined
  }

  private validateEvent() {
    //validate if dates aligns
    if(
      (this.m_oEvent.peakDate<this.m_oEvent.startDate) ||
      (this.m_oEvent.peakDate>this.m_oEvent.endDate) ||
      (this.m_oEvent.startDate>this.m_oEvent.endDate)
    ){
      this.m_bIsDateInvalid=true;
      this.m_sDateErrorText="Please ensure the dates are aligned";
      return false;
    }
    //validate if area is created
    if(!this.m_oEvent.bbox){
      this.m_oNotificationServiceDialog.openSnackBar(
        "Please create area for your event",
        "Error",
        "danger"
      );
      return false;
    }
    return true;
  }

  onReturn() {
    this.m_oRouter.navigateByUrl(`monitor/${this.m_sAreaId}`)
  }

  goToMonitorWithEventPeakDate(oEvent: EventViewModel) {
    if (oEvent.peakDate) {
      this.m_oRouter.navigate([`monitor/${this.m_sAreaId}`], {
        state: { peakDate: oEvent.peakDate }
      });
    }
  }

}
