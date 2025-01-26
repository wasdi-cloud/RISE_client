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
import {MatInputModule} from "@angular/material/input";
import {RiseDateInputComponent} from "../../components/rise-date-input/rise-date-input.component";
import {MatSlideToggleChange, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {geojsonToWKT} from "@terraformer/wkt";
import {MapService} from "../../services/map.service";

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
export class EventsComponent implements OnInit {
  m_bIsOngoingEvent: boolean = false;
  m_sAreaId: string;
  m_bCreateNewEvent: boolean = false;
  m_bUpdatingEvent: boolean = false;
  m_aoEvents: EventViewModel[] = [];
  m_aoAreasOfOperations: Array<AreaViewModel> = [];
  m_oEvent: EventViewModel = {};
  m_sStartDate: any
  m_sPeakDate: any
  m_sEndDate: any

  constructor(
    private m_oEventService: EventService,
    private m_oActiveRoute: ActivatedRoute,
    private m_oMapService: MapService,
    private m_oNotificationServiceDialog: NotificationsDialogsService,
  ) {
  }

  ngOnInit() {
    this.getActiveAOI()

  }

  onCreateNewEvent() {
    this.m_bCreateNewEvent = true;
  }

  editEvent(oEvent: EventViewModel) {
    this.m_oEvent=oEvent;
    this.m_sStartDate=this.formatEpochToDate(this.m_oEvent.startDate);
    this.m_sPeakDate=this.formatEpochToDate(this.m_oEvent.peakDate);
    this.m_sEndDate=this.formatEpochToDate(this.m_oEvent.endDate);

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
    if (this.validateInputs()) {
      if(this.m_bCreateNewEvent){
        this.addNewEvent()
      }else if (this.m_bUpdatingEvent){
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
        let markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
        // Convert circle to WKT (approximated as a polygon with 64 points)
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
      }
    }
  }



  uploadImage($event: any) {

  }

  uploadDocument($event: any) {

  }

  onSwitchButton(toggel: MatSlideToggleChange) {
    this.m_bIsOngoingEvent = toggel.checked;
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
  onDateChange(dateString: string, property: 'startDate' | 'endDate' | 'peakDate'): void {
    const epoch = this.convertDateToEpoch(dateString);

    if (epoch !== null) {
      this.m_oEvent[property] = epoch; // Dynamically update the specified property
    } else {
      console.warn(`Invalid date format for ${property}. Expected mm-dd-yyyy.`);
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
      },
      error: (oError) => {
        console.error(oError);
      }
    })
  }

  private getActiveAOI() {
    this.m_oActiveRoute.paramMap.subscribe(params => {
      this.m_sAreaId = params.get('aoiId');
      this.getEventsList();
    });
  }

  private validateInputs() {
    if (!this.m_oEvent) {
      return false;
    }
    if (!this.m_oEvent.name) return false;
    if (!this.m_oEvent.description) return false;
    if (!this.m_oEvent.bbox) return false;
    if (!this.m_oEvent.startDate) return false;
    if (!this.m_oEvent.endDate) return false;
    if (!this.m_oEvent.peakDate) return false;
    if (!this.m_oEvent.type) return false;

    return true;
  }
}
