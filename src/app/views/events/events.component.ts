import L from 'leaflet'; // <--- ADD THIS
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
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
import {ConstantsService} from '../../services/constants.service';
import {AttachmentService} from '../../services/api/attachment.service';
import {AreaService} from '../../services/api/area.service';
import {MatDialog} from "@angular/material/dialog";
import {ImageDialogComponent} from '../../dialogs/image-dialog/image-dialog.component';
import {UserRole} from "../../models/UserRole";
import {Subject, takeUntil} from "rxjs";


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
    TitleCasePipe,
    NgClass,
    DecimalPipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit, OnDestroy {
  m_sFilesSortType: 'oldest' | 'newest' | 'az' | 'za' = 'oldest';
  m_aoAllFiles: any[] = []; // Unified list for the UI
  m_asOriginalAllFiles: any[] = []; // Backup for "Time Added" sorting
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
  m_sEventNameError: string = "";
  m_bEventNameIsValid: boolean = true;
  m_bIsDateInvalid: boolean = false;
  m_sDateErrorText: string = "";
  m_sUploadDocName: any;
  m_oUploadDocFile: any;
  m_sUploadImageName: any;
  m_oUploadImageFile: any;
  m_oArea: AreaViewModel = null;
  m_sAreaName: string = null;
  m_asEventImages: string[] = [];
  m_asEventDocs: string[] = [];
// --- New Geolocation Upload Variables ---
  m_oSelectedLocation: { lat: number; lng: number } | null = null;
  m_oTempLocationMarker: any = null;
  // --- ADD THESE TWO MISSING VARIABLES ---
  m_aoEventImageMarkers: Array<{ fileName: string, lat: number, lon: number, type?: string }> = [];
  private m_oDestroy$: Subject<void> = new Subject<void>();
  private m_oImageMarkersLayer: any = null;

  constructor(
    private m_oEventService: EventService,
    private m_oActiveRoute: ActivatedRoute,
    private m_oMapService: MapService,
    private m_oRouter: Router,
    private m_oNotificationServiceDialog: NotificationsDialogsService,
    private m_oConstantsService: ConstantsService,
    private m_oAttachmentService: AttachmentService,
    private m_oAreaService: AreaService,
    private m_oImageDialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.getEventTypes()
    this.getActiveAOI()
  }

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  onCreateNewEvent() {
    this.m_bCreateNewEvent = true;
    let oArea = this.m_oConstantsService.getActiveAOI();
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oArea)) {
      setTimeout(() => {
        this.m_oMapService.flyToMonitorBounds(oArea.bbox)
      }, 50)
    }
  }

  getEventTypes() {
    this.m_aoEventTypes = Object.values(EventType).map(type => ({
      name: type.toLowerCase().replace('_', ' '), // Formatting name for display
      value: type
    }));


  }

  editEvent(oEvent: EventViewModel) {
    this.m_oEvent = oEvent;
    this.m_sStartDate = this.formatEpochToDate(this.m_oEvent.startDate * 1000);
    this.m_sPeakDate = this.formatEpochToDate(this.m_oEvent.peakDate * 1000);
    this.m_sEndDate = this.formatEpochToDate(this.m_oEvent.endDate * 1000);

    this.loadEventAttachments();

    this.m_bUpdatingEvent = true;
    let oArea = this.m_oConstantsService.getActiveAOI();
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oArea)) {
      setTimeout(() => {
        this.m_oMapService.flyToMonitorBounds(oArea.bbox)
      }, 50)
    }
  }

  loadEventAttachments() {
    this.m_aoAllFiles = [];
    this.m_asOriginalAllFiles = [];

    // FIX: Clear markers ONCE at the top to prevent async race conditions!
    this.m_aoEventImageMarkers = [];

    // 1. FOR IMAGES/VIDEOS:
    this.m_oAttachmentService.list("event_images", this.m_oEvent.id).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        this.m_asEventImages = oResponse.files || [];

        for (let i = 0; i < oResponse.files.length; i++) {
          let sFileName = oResponse.files[i];
          let bIsVideo = sFileName.toLowerCase().endsWith('.mp4') || sFileName.toLowerCase().endsWith('.mov') || sFileName.toLowerCase().endsWith('.avi');
          let sType = bIsVideo ? 'video' : 'image';

          this.m_asOriginalAllFiles.push({name: sFileName, type: sType});

          // Capture coordinates
          if (oResponse.lats && oResponse.lngs && oResponse.lats[i] !== -9999.0 && oResponse.lngs[i] !== -9999.0) {
            this.m_aoEventImageMarkers.push({
              fileName: sFileName, lat: oResponse.lats[i], lon: oResponse.lngs[i], type: sType
            });
          }
        }
        this.applyFileSort();
        this.addImageMarkersToMap();
      }
    });

    // 2. FOR DOCUMENTS:
    this.m_oAttachmentService.list("event_docs", this.m_oEvent.id).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        this.m_asEventDocs = oResponse.files || [];

        for (let i = 0; i < oResponse.files.length; i++) {
          let sFileName = oResponse.files[i];
          let bIsVideo = sFileName.toLowerCase().endsWith('.mp4') || sFileName.toLowerCase().endsWith('.mov') || sFileName.toLowerCase().endsWith('.avi');
          let sType = bIsVideo ? 'video' : 'doc';

          this.m_asOriginalAllFiles.push({name: sFileName, type: sType});

          // Capture coordinates
          if (oResponse.lats && oResponse.lngs && oResponse.lats[i] !== -9999.0 && oResponse.lngs[i] !== -9999.0) {
            this.m_aoEventImageMarkers.push({
              fileName: sFileName, lat: oResponse.lats[i], lon: oResponse.lngs[i], type: sType
            });
          }
        }
        this.applyFileSort();
        this.addImageMarkersToMap();
      }
    });
  }

  previewFile(file: any) {
    if (file.type === 'image' || file.type === 'video') {
      this.onPreviewImage(file.name);
    } else {
      this.onPreviewDoc(file.name);
    }
  }

  addImageMarkersToMap(): void {
    this.clearImageMarkers();

    if (this.m_aoEventImageMarkers.length === 0) {
      return;
    }

    const oMap = this.m_oMapService.getMap();
    this.m_oImageMarkersLayer = L.layerGroup().addTo(oMap);

    this.m_aoEventImageMarkers.forEach(oMarker => {

      let sIconName = 'photo_camera';
      let sIconColor = '#efba35'; // gold

      if (oMarker.type === 'doc') {
        sIconName = 'description';
        sIconColor = '#a8b2bc'; // light gray
      } else if (oMarker.type === 'video') {
        sIconName = 'videocam';
        sIconColor = '#dc3545'; // red
      }

      const oIcon = L.divIcon({
        html: `<span class="material-icons" style="color: ${sIconColor}; font-size: 24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${sIconName}</span>`,
        className: 'custom-image-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });

      const oImageMarkerLeaflet = L.marker([oMarker.lat, oMarker.lon], {
        icon: oIcon,
        title: oMarker.fileName
      });

      oImageMarkerLeaflet.on('click', () => {
        this.previewFile({name: oMarker.fileName, type: oMarker.type || 'image'});
      });

      oImageMarkerLeaflet.bindTooltip(oMarker.fileName, {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
      });

      this.m_oImageMarkersLayer.addLayer(oImageMarkerLeaflet);
    });
  }

  // --- New Map Click Handlers ---
  onMapClicked(event: { lat: number, lng: number }) {
    if (this.m_bCreateNewEvent || this.m_bUpdatingEvent) {
      this.m_oSelectedLocation = {lat: event.lat, lng: event.lng};

      const oMap = this.m_oMapService.getMap();

      // Remove old temp marker if it exists
      if (this.m_oTempLocationMarker) {
        oMap.removeLayer(this.m_oTempLocationMarker);
      }

      // Draw a bright green pin to indicate the pending upload location
      this.m_oTempLocationMarker = L.marker([event.lat, event.lng], {
        icon: L.divIcon({
          html: '<span class="material-icons" style="color: #00ff00; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">add_location</span>',
          className: 'custom-temp-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(oMap);
    }
  }

  clearLocation() {
    this.m_oSelectedLocation = null;
    if (this.m_oTempLocationMarker) {
      this.m_oMapService.getMap().removeLayer(this.m_oTempLocationMarker);
      this.m_oTempLocationMarker = null;
    }
  }

  // --- Upgraded Upload Methods ---
  uploadImage() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUploadImageFile)) {
      return false;
    }

    const oFormData = new FormData();
    oFormData.append("file", this.m_oUploadImageFile);

    // Pass the coordinates to the service!
    this.m_oAttachmentService.upload("event_images", this.m_oEvent.id, this.m_sUploadImageName, oFormData, false, this.m_oSelectedLocation?.lat, this.m_oSelectedLocation?.lng)
      .pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: oResponse => {
        this.m_oUploadImageFile = null;
        this.m_sUploadImageName = "";
        this.clearLocation(); // Clear the green pin after success
        this.loadEventAttachments();
      },
      error: oError => console.log("Error ", oError)
    });
    return true;
  }

  uploadDocument() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUploadDocFile)) {
      return false;
    }

    const oFormData = new FormData();
    oFormData.append("file", this.m_oUploadDocFile);

    // Pass the coordinates to the service!
    this.m_oAttachmentService.upload("event_docs", this.m_oEvent.id, this.m_sUploadDocName, oFormData, false, this.m_oSelectedLocation?.lat, this.m_oSelectedLocation?.lng)
      .pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: oResponse => {
        this.m_oUploadDocFile = null;
        this.m_sUploadDocName = "";
        this.clearLocation(); // Clear the green pin after success
        this.loadEventAttachments();
      },
      error: oError => console.log("Error ", oError)
    });
    return true;
  }

  // --- Unified Sorting Method ---
  applyFileSort() {
    // Create a shallow copy so we don't destroy the original array
    let copy = [...this.m_asOriginalAllFiles];

    if (this.m_sFilesSortType === 'oldest') {
      this.m_aoAllFiles = copy;
    } else if (this.m_sFilesSortType === 'newest') {
      this.m_aoAllFiles = copy.reverse();
    } else if (this.m_sFilesSortType === 'az') {
      this.m_aoAllFiles = copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.m_sFilesSortType === 'za') {
      this.m_aoAllFiles = copy.sort((a, b) => b.name.localeCompare(a.name));
    }
  }

  toggleTimeSort() {
    // Swap between oldest and newest
    this.m_sFilesSortType = this.m_sFilesSortType === 'oldest' ? 'newest' : 'oldest';
    this.applyFileSort();
  }

  toggleAlphaSort() {
    // Swap between A-Z and Z-A
    this.m_sFilesSortType = this.m_sFilesSortType === 'az' ? 'za' : 'az';
    this.applyFileSort();
  }


  //todo we might want to add a confirmation
  deleteEvent(oEvent: EventViewModel) {
    if (oEvent) {
      this.m_oNotificationServiceDialog.openConfirmationDialog(
        "Are you sure you want to delete this event",
        'alert',
      ).subscribe((oResponse) => {
        if (oResponse) {
          this.m_oEventService.deleteEvent(oEvent.id).pipe(takeUntil(this.m_oDestroy$)).subscribe({
            next: (oResponse) => {
              this.getEventsList();
              this.m_oNotificationServiceDialog.openSnackBar("Event deleted successfully", "Success", "success")
            },
            error: (oError) => {
              this.m_oNotificationServiceDialog.openSnackBar("Error deleting the event", "Error", "danger")
            }
          })
        }
      })


    }
  }


  updateEvent() {
    this.m_oEventService.updateEvent(this.m_oEvent).pipe(takeUntil(this.m_oDestroy$)).subscribe(
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

    if (oUser.role != UserRole.FIELD) {
      return true;
    }

    return false;
  }

  addNewEvent() {
    this.m_oEventService.addEvent(this.m_sAreaId, this.m_oEvent).pipe(takeUntil(this.m_oDestroy$)).subscribe(
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
    let oArea = this.m_oConstantsService.getActiveAOI();
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oArea)) {
      setTimeout(() => {
        this.m_oMapService.flyToMonitorBounds(oArea.bbox)
      }, 50)
    }

  }

  enableEventSubmit() {
    return false;
  }

  enableAOISubmit() {
    return false;
  }

  executeEventSaving() {
    if (this.validateEvent()) {
      if (this.m_bCreateNewEvent) {

        // this.m_oEvent.startDate /= 1000;
        // this.m_oEvent.peakDate /= 1000;
        // this.m_oEvent.endDate /= 1000;

        this.addNewEvent()
      } else if (this.m_bUpdatingEvent) {
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
        this.m_oEvent.markerCoordinates = 'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
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


  setImageFile(oEvent: any) {
    this.m_sUploadImageName = oEvent.file.name;
    this.m_oUploadImageFile = oEvent.file;
  }


  setDocumentFile(oEvent: any) {
    this.m_sUploadDocName = oEvent.file.name;
    this.m_oUploadDocFile = oEvent.file;
  }

  onSwitchOnGoingButton(toggel: MatSlideToggleChange) {
    this.m_oEvent.inGoing = toggel.checked;
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
      this.m_oEvent[sProperty] = oEpoch / 1000; // Dynamically update the specified property
    } else {
      console.warn(`Invalid date format for ${sProperty}. Expected mm-dd-yyyy.`);
      this.m_sDateErrorText = "Invalid date format"
    }
  }

  // Validate the date
  isValidDate(mm: number, dd: number, yyyy: number): boolean {
    if (!mm || !dd || !yyyy) return false;
    if (yyyy >= 2200 || yyyy <= 0) return false;
    const date = new Date(yyyy, mm - 1, dd);
    return (
      date.getFullYear() === yyyy &&
      date.getMonth() === mm - 1 &&
      date.getDate() === dd
    );
  }

  // Handle user input: validate and convert to epoch

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
    ) {
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

  onReturn() {
    this.m_oRouter.navigateByUrl(`monitor/${this.m_sAreaId}`)
  }

  goToMonitorWithEventPeakDate(oEvent: EventViewModel) {
    if (oEvent.peakDate) {
      this.m_oRouter.navigate([`monitor/${this.m_sAreaId}`], {
        state: {
          id: oEvent.id,
          peakDate: oEvent.peakDate,
          name: oEvent.name,
          type: oEvent.type,
          startDate: oEvent.startDate,
          endDate: oEvent.endDate
        }
      });
    }
  }

  onPreviewImage(sFileName: string) {
    if (sFileName) {

      let sLink = this.m_oAttachmentService.getAttachmentLink("event_images", this.m_oEvent.id, sFileName)

      let oPayload =
        {
          fileName: sFileName,
          link: sLink,
          type: "image",
          eventId: this.m_oEvent.id
        }

      // Open the Material Dialog with the image
      const oPreviewDialogRef = this.m_oImageDialog.open(ImageDialogComponent, {
        data: {oPayload},
        width: '90vw'
      });

      // Handle dialog close event
      oPreviewDialogRef.afterClosed().subscribe(result => {
        this.loadEventAttachments();
      });

    }
  }

  onPreviewDoc(sFileName: string) {
    if (sFileName) {

      let sLink = this.m_oAttachmentService.getAttachmentLink("event_docs", this.m_oEvent.id, sFileName)

      let sType = "txt";

      if (sFileName.toLowerCase().endsWith('.pdf') || sFileName.toLowerCase().endsWith('.docx') || sFileName.toLowerCase().endsWith('.doc')) {
        sType = "pdf";
      }

      let oPayload =
        {
          fileName: sFileName,
          link: sLink,
          type: sType,
          eventId: this.m_oEvent.id
        }

      // Open the Material Dialog with the image
      const oPreviewDialogRef = this.m_oImageDialog.open(ImageDialogComponent, {
        data: {oPayload},
        width: '90vw'
      });

      // Handle dialog close event
      oPreviewDialogRef.afterClosed().subscribe(result => {
        this.loadEventAttachments();
      });
    }
  }

  // --- Missing Marker Methods ---
  clearImageMarkers(): void {
    if (this.m_oImageMarkersLayer) {
      const oMap = this.m_oMapService.getMap();
      oMap.removeLayer(this.m_oImageMarkersLayer);
      this.m_oImageMarkersLayer = null;
    }
  }

  private getEventsList() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sAreaId)) {
      return;
    }

    this.m_oEventService.getEvents(this.m_sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (aoEvents) => {
        this.m_aoEvents = aoEvents;
        this.m_aoOriginalEvents = [...this.m_aoEvents];

      },
      error: (oError) => {
        console.error(oError);
      }
    })
  }

  private getActiveAOI() {
    this.m_oActiveRoute.paramMap.subscribe(params => {
      this.m_sAreaId = params.get('aoiId');

      this.m_oAreaService.getAreaById(this.m_sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oArea: AreaViewModel) => {
          this.m_oArea = oArea;

          this.m_oMapService.flyToMonitorBounds(oArea.bbox);
          this.m_sAreaName = oArea.name;

          if (this.m_oConstantsService.getActiveAOI() == null) {
            this.m_oConstantsService.setActiveArea(oArea);
          }
        }
      });

      this.getEventsList();
    });
  }

  private validateEvent() {
    //validate if dates aligns
    if (
      (this.m_oEvent.peakDate < this.m_oEvent.startDate) ||
      (this.m_oEvent.peakDate > this.m_oEvent.endDate) ||
      (this.m_oEvent.startDate > this.m_oEvent.endDate)
    ) {
      this.m_bIsDateInvalid = true;
      this.m_sDateErrorText = "Please ensure the dates are aligned";
      return false;
    }
    //validate if area is created
    if (!this.m_oEvent.bbox) {
      this.m_oNotificationServiceDialog.openSnackBar(
        "Please create area for your event",
        "Error",
        "danger"
      );
      return false;
    }
    return true;
  }


}
