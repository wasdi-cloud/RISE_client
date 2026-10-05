import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Subject, Subscription, takeUntil} from 'rxjs';

import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray,} from '@angular/cdk/drag-drop';

import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';
import {RiseLayerItemComponent} from '../../components/rise-layer-item/rise-layer-item.component';
import {RiseMapChipComponent} from '../../components/rise-map-chip/rise-map-chip.component';
import {RiseMapComponent} from '../../components/rise-map/rise-map.component';
import {RiseTextInputComponent} from '../../components/rise-text-input/rise-text-input.component';
import {RiseTimebarComponent} from '../../components/rise-timebar/rise-timebar.component';
import {RiseUserMenuComponent} from '../../components/rise-user-menu/rise-user-menu.component';

import {AreaService} from '../../services/api/area.service';
import {AreaViewModel} from '../../models/AreaViewModel';
import {ConstantsService} from '../../services/constants.service';
import {LayerService} from '../../services/api/layer.service';
import {MapAPIService} from '../../services/api/map.service';
import {MapService} from '../../services/map.service';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {AttachmentService} from '../../services/api/attachment.service';

import {ImageDialogComponent} from '../../dialogs/image-dialog/image-dialog.component';

import {LayerTypes} from './layer-types';
import {FilterPipe} from '../../shared/pipes/filter.pipe';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {MatDialog} from "@angular/material/dialog";
import {LayerPropertiesComponent} from "./layer-properties/layer-properties.component";
import {LayerAnalyzerComponent} from "./layer-analyzer/layer-analyzer.component";
import {LayerViewModel} from "../../models/LayerViewModel";
import {EventService} from "../../services/api/event.service";
import {EventViewModel} from "../../models/EventViewModel";
import {EventType} from "../../models/EventType";
import {ImpactsDialogComponent} from "../../dialogs/impacts-dialog/impacts-dialog.component";
import {PrintMapDialogComponent} from "../../dialogs/print-map-dialog/print-map-dialog.component";
import { PluginService } from '../../services/api/plugin.service';
import e from 'express';
import L from 'leaflet';
import {FormsModule} from "@angular/forms";
import {UserRole} from "../../models/UserRole";

/**
 * TODO THERE IS A BIG NAMING PROBLEM HERE, plugin, maps, layers, plugins here in the client is
 * TODO the maps in server side, we need to fix this, for more code readability
 */
/**
   * UC_120 Monitor Area of Operations
   */
  @Component({
  selector: 'app-monitor',
  standalone: true,
    imports: [
      CdkDropList,
      CdkDrag,
      CommonModule,
      FilterPipe,
      RiseButtonComponent,
      RiseLayerItemComponent,
      RiseMapChipComponent,
      RiseMapComponent,
      RiseTextInputComponent,
      RiseTimebarComponent,
      RiseUserMenuComponent,
      TranslateModule,
      FormsModule,

    ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css',
})
export class MonitorComponent implements OnInit,AfterViewInit,OnDestroy {

  /**
   * Variables for unified File Sorting in the sidebar
   */
  m_sFilesSortType: 'oldest' | 'newest' | 'az' | 'za' = 'oldest';
  m_aoAllFiles: any[] = [];
  m_asOriginalAllFiles: any[] = [];
  public m_sSortColumn: string = 'name';
  public m_bSortAscending: boolean = true;
  public m_sSidebarTab: 'layers' | 'event' | 'impacts' = 'layers';
  public m_sAttachmentFilter: 'all' | 'media' | 'doc' = 'all';
  public m_aoImpactSummary: Array<{ type: string; count: number }> = [];

  get m_aoVisibleAttachments(): any[] {
    return this.m_aoAllFiles.filter(oFile =>
      this.m_sAttachmentFilter === 'all' ||
      (this.m_sAttachmentFilter === 'media' ? oFile.type !== 'doc' : oFile.type === 'doc')
    );
  }

  selectImpactType(sType: string): void {
    this.m_sSelectedTypeFilter = this.m_sSelectedTypeFilter === sType ? 'ALL' : sType;
    this.applyImpactTypeFilter();
  }
  /**
   * Collapsible section flags for sidebar
   */
  public m_bLayersExpanded: boolean = true;
  public m_bEventInfoExpanded: boolean = true;
  public m_bImpactsTableExpanded: boolean = true;

  /**
   * Raw and filtered table data from GeoServer WFS
   */
  public m_aoImpactTableData: Array<{ name: string; type: string; raw: any }> = [];
  public m_aoFilteredImpactTableData: Array<{ name: string; type: string; raw: any }> = [];

  /**
   * Dropdown filter options
   */
  public m_asImpactTypes: Array<string> = [];
  public m_sSelectedTypeFilter: string = 'ALL';

  /**
   * Active impact layer WFS details for CSV Export
   */
  public m_sActiveImpactWfsUrl: string = '';
  public m_sActiveImpactLayerId: string = '';

  /**
   * Flag to show either 2D Leaflet map or 3D Cesium Map (TODO: CESIUM)
   */
  m_bShow2D: boolean = true;

  /**
   * Active area of operation
   */
  m_oAreaOfOperation: AreaViewModel = {} as AreaViewModel;

  /**
   * Area ID
   */
  m_sAreaId: string = null;

  /**
   * List of Layers published on the map
   */
  m_aoLayers: Array<LayerViewModel> = [];
  /**
   * List of Layers published on the map in reverse order
   */
  m_aoReversedLayers: Array<LayerViewModel> = [];

  /**
   * User's selected date (initialized as most recent date then passed from TIMEBAR COMPONENT)
   */
  m_iSelectedDate: any = '';

  /**
   * Current date
   */
  m_iCurrentDate: number = null;

  /**
   * Available plugins for the workspace
   */
  m_aoAreaPlugins: Array<any> = [];

    /**
   * Selected plugin for the two-level menu (first level selection)
   */
  m_oSelectedPlugin: any = null;

  /**
   * Visible map buttons for the selected plugin
   */
  m_aoVisibleMapLayersButtons: Array<any> = [];

  /**
   * Search string for users to search for Layer items based on their MAP ID
   */
  m_sSearchString: string = null;

  /**
   * List of Events
   */
  m_aoEvents:EventViewModel[]=[]

  /**
   * List of Event images
   */
  m_asEventImages: string[] = [];

  /**
   * List of Event image markers
   */
  m_aoEventImageMarkers: Array<{fileName: string, lat: number, lon: number, type?: string}> = [];

  /**
   * Layer group for image markers
   */
  private m_oImageMarkersLayer: any = null;

  /**
   * List of Event documents
   */
  m_asEventDocs: string[] = [];

  /**
   * Initial peak date passed from event list navigation
   */
  m_iInitialPeakDate: number;

  /**
   * Number of visible plugins in the list
   */
  m_iVisibleCount = 5;

  /**
   * Flag to show all plugins or only a limited number
   */
  m_bShowAllMaps = false;

  /**
   * Name of the area of operations
   */
  m_sAreaName = "";

  /**
   * Timer to update the current date
   */
  private m_oLiveTimer: any;

  /**
   * Flag to show the event info box
   */
  m_bShowEventInfo:boolean=false;

  /**
   * Event information
   */
  m_oSelectedEvent: EventViewModel = {} as EventViewModel;

  /**
   * Layer analyzer sub pointer
   */
  private m_oLayerAnalyzerSubscription: Subscription;

  /**
   * WKT of the measurement tool
   */
  m_sMeasurementToolWkt:string;

  /**
   * a flag to distinguish going to event from the event page or click on the event marker
   */
  private m_bIsNavigatedFromEventList = false;

  /**
   *
   */
  @ViewChild('btnContainer', { static: false }) btnContainerRef!: ElementRef;

  /**
   *
   */
  @ViewChild('tempFix', { static: false }) tempFixRef!: ElementRef;

  /**
   * // IMPORTANT: Declare the property to hold the bound function reference
   */
  private m_oFullscreenChangeListener: () => void;

  /**
   * Flag to indicate if live mode is active
   */
  private m_bIsLive: boolean=true;

  /**
   * Subject to handle unsubscription on component destroy
   */
  private m_oDestroy$ = new Subject<void>();


  // --- Quick Upload Variables ---
  m_oQuickUploadFile: any = null;
  m_sQuickUploadFileName: string = "";
  m_sQuickUploadType: 'image' | 'doc' = 'image';

  m_oSelectedLocation: { lat: number; lng: number } | null = null;
  m_oTempLocationMarker: any = null;

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAreaService: AreaService,
    private m_oConstantsService: ConstantsService,
    private m_oLayerService: LayerService,
    private m_oMapAPIService: MapAPIService,
    private m_oPluginAPIService: PluginService,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oDialog: MatDialog,
    private m_oEventService: EventService,
    private m_oAttachmentService: AttachmentService,
    private m_oImageDialog: MatDialog
  ) {
    const navigation = this.m_oRouter.getCurrentNavigation();
    const state = navigation?.extras?.state as { id?:string, peakDate?: string,name?:string,type?:EventType,startDate:string,endDate?:string };

    // Check if navigated from event list with state
    if (state?.peakDate) {
      // ... setup ...
      this.m_bShowEventInfo = true;

      // 1. Get Peak Date from Timestamp
      const iPeakDateInSeconds = Number(state?.peakDate);
      const oPeakDate = new Date(iPeakDateInSeconds * 1000);

      // 2. FORCE UTC END OF DAY
      // We use Date.UTC() to get a timestamp for the specific UTC Day at 23:59:59
      const iAdjustedTimestamp = Date.UTC(
        oPeakDate.getUTCFullYear(),
        oPeakDate.getUTCMonth(),
        oPeakDate.getUTCDate(),
        23, 59, 59, 0
      );

      // 3. Set Component Variables
      this.m_iSelectedDate = iAdjustedTimestamp;
      this.m_iInitialPeakDate = iAdjustedTimestamp / 1000;
    }

    // Initialize the bound function for fullscreen change
    this.m_oFullscreenChangeListener = this.handleFullScreenChange.bind(this);
  }

  ngOnInit(): void {

    this.m_iCurrentDate=this.getCurrentDate();

    if (!this.m_bShowEventInfo) {
      this.startLiveTimer();
      this.m_bIsLive=true;
    }
    else {
      this.m_iSelectedDate = this.m_oSelectedEvent.peakDate;
      this.m_bIsLive = false;
    }

    // Get the data of the AOI
    this.getActiveAOI();

    // Register the event to show layer analyzer
    this.m_oLayerAnalyzerSubscription=this.m_oMapService.m_oLayerAnalyzerDialogEventEmitter.subscribe((bShouldOpenDialog: boolean) => {
      if (bShouldOpenDialog) {
        this.openLayerAnalyzerDialog();
      }
    });

    // Get the list of events of the area
    this.getEvents()
  }

  ngAfterViewInit(): void {
    // Add the event listener using the stored reference
    document.addEventListener('fullscreenchange', this.m_oFullscreenChangeListener);

  }

  ngOnDestroy(): void {
    this.stopLiveTimer();
    // Unsubscribe when the component is destroyed
    if (this.m_oLayerAnalyzerSubscription) {
      this.m_oLayerAnalyzerSubscription.unsubscribe();
    }

    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();

    // IMPORTANT: Remove the fullscreenchange event listener
    document.removeEventListener('fullscreenchange', this.m_oFullscreenChangeListener);
  }


  public sortTable(sColumn: string): void {
    // If clicking the same column, toggle direction. Otherwise, sort ascending.
    if (this.m_sSortColumn === sColumn) {
      this.m_bSortAscending = !this.m_bSortAscending;
    } else {
      this.m_sSortColumn = sColumn;
      this.m_bSortAscending = true;
    }

    this.m_aoFilteredImpactTableData.sort((a, b) => {
      let valA = a[sColumn] ? a[sColumn].toString().toLowerCase() : '';
      let valB = b[sColumn] ? b[sColumn].toString().toLowerCase() : '';

      if (valA < valB) return this.m_bSortAscending ? -1 : 1;
      if (valA > valB) return this.m_bSortAscending ? 1 : -1;
      return 0;
    });
  }


  // --- Quick Upload Methods for Monitor ---

  canUserWriteArea(): boolean {
    let oUser = this.m_oConstantsService.getUser();

    if (oUser == null || this.m_oAreaOfOperation == null) {
      return false;
    }

    // User can write if they belong to the same organization, OR if they are an admin
    if (oUser.organizationId == this.m_oAreaOfOperation.organizationId) {
      return true;
    }

    if (oUser.role != UserRole.FIELD) {
      return true;
    }

    return false;
  }

  triggerQuickUpload(sType: 'image' | 'doc') {
    this.m_sQuickUploadType = sType;

    // Create a hidden file input dynamically to trigger the browser's file picker
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = sType === 'image' ? 'image/*,video/mp4,video/quicktime' : '.pdf,.doc,.docx,.txt,.csv';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.m_oQuickUploadFile = file;
        this.m_sQuickUploadFileName = file.name;

        // Let the user know they can click the map now!
        this.m_oNotificationService.openSnackBar(
          "File selected! Click anywhere on the map to pin its location, or click Upload to skip.",
          "Location Required?",
          "success"
        );
      }
    };

    fileInput.click();
  }

  // --- New Map Click Handlers for Monitor ---
  onMapClicked(event: {lat: number, lng: number}) {
    // Only drop a pin if we are actively trying to quick-upload a file
    if (this.m_oQuickUploadFile) {
      this.m_oSelectedLocation = { lat: event.lat, lng: event.lng };

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

  // --- Update these two existing methods ---
  cancelQuickUpload() {
    this.m_oQuickUploadFile = null;
    this.m_sQuickUploadFileName = "";
    this.clearLocation(); // Clear the green pin!
  }

  executeQuickUpload() {
    if (!this.m_oQuickUploadFile) return;

    const oFormData = new FormData();
    oFormData.append("file", this.m_oQuickUploadFile);

    const sEndpoint = this.m_sQuickUploadType === 'image' ? 'event_images' : 'event_docs';

    // We now use the actual dropped pin coordinates instead of the measurement tool!
    this.m_oAttachmentService.upload(sEndpoint, this.m_oSelectedEvent.id, this.m_sQuickUploadFileName, oFormData, false, this.m_oSelectedLocation?.lat, this.m_oSelectedLocation?.lng)
      .pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        this.m_oNotificationService.openSnackBar("Attachment uploaded successfully!", "Success", "success");
        this.cancelQuickUpload(); // Clears file and green pin
        this.loadEventAttachments(this.m_oSelectedEvent.id); // Refresh list
      },
      error: (oError) => {
        console.error("Upload failed", oError);
        this.m_oNotificationService.openSnackBar("Failed to upload attachment", "Error", "danger");
      }
    });
  }

    /**
     * Handler for the fullscreenchange event.
     * This method contains the logic to move the button container
     * in and out of the fullscreen element.
     */
    private handleFullScreenChange(): void {

      const oFullscreenElement = document.fullscreenElement;
      const oBtnContainer = this.btnContainerRef.nativeElement;
      const oOriginalParent = this.tempFixRef.nativeElement;

      const sFullscreenClass = 'fullscreen-btn-container';
      const sNormalClass = 'btn-select-container';

      // Add or remove the fullscreen class based on the fullscreen state
      if (oFullscreenElement && !oFullscreenElement.contains(oBtnContainer)) {
        // If fullscreen is active and the button container is not yet its child, append it
        oFullscreenElement.appendChild(oBtnContainer);
        oBtnContainer.classList.add(sFullscreenClass);
        oBtnContainer.classList.remove(sNormalClass);
      }
      else if (!oFullscreenElement) {
        // If not in fullscreen, return the button container to its original parent
        // Add a null check for oOriginalParent, as the component might be in a tearing-down phase
        if (oOriginalParent) {
          oOriginalParent.insertBefore(oBtnContainer, oOriginalParent.firstChild);
          oBtnContainer.classList.remove(sFullscreenClass);
          oBtnContainer.classList.add(sNormalClass);
        } else {
          // Fallback: If original parent is somehow not available (e.g., component already partially destroyed)
          // You might want to log an error or handle this case.
          console.warn('Original parent for button container not found during fullscreen exit. Element might be detached.');
          // Consider appending to body or a known global container if this is a critical UI element
        }
      }
    }

  startLiveTimer() {
    this.stopLiveTimer(); // clear any existing interval

    this.m_oLiveTimer = setInterval(() => {
      if (this.m_bIsLive) {
        this.m_iCurrentDate = this.getCurrentDate();
      }
    }, 1 * 60 * 1000); // every minute
  }

  stopLiveTimer() {
    if (this.m_oLiveTimer) {
      clearInterval(this.m_oLiveTimer);
      this.m_oLiveTimer = null;
    }
  }

  /**
   * Get area of operations from the constants service if it was active or the URL if on refresh then open
   * UC: RISE shows the Monitor Section containing a browsable map (including a geocoding search tool)
   * @returns void
   */
  getActiveAOI(): void {
    if (this.m_oActivatedRoute.snapshot.params['aoiId']) {
      this.m_sAreaId = this.m_oActivatedRoute.snapshot.params['aoiId'];
      this.openAOI(this.m_sAreaId);
    } else {
      this.m_oNotificationService.openInfoDialog(
        'Could not open area of operations',
        'danger',
        'Error'
      );

      this.m_oRouter.navigateByUrl('dashboard');
    }
  }

  /**
   * Get the current date in seconds
   * @returns
   */
  getCurrentDate(): number {
    // Current timestamp in seconds
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Retrieve area of operations info from the server
   * UC: RISE shows the Monitor Section containing a browsable map (including a geocoding search tool)
   * @param sAreaId
   */
  openAOI(sAreaId: string): void {
    // Get the main Area information from the server
    this.m_oAreaService.getAreaById(sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({

      next: (oResponse) => {
        // We need a response
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {

          // Save the area
          this.m_oAreaOfOperation = oResponse;
          // Covenient variable for the name
          this.m_sAreaName = this.m_oAreaOfOperation.name;
          // Save the area in the constants service
          this.m_oConstantsService.setActiveArea(this.m_oAreaOfOperation);

          // Get the plugins active in the area
          this.getPluginsByArea(oResponse.id);

          // Fly to the area bounds
          this.m_oMapService.flyToMonitorBounds(oResponse.bbox);

          this.m_oLayerService.areaLayerCount(sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
            next: (oResponse) => {
              if (oResponse != null) {
                if (oResponse<=0) {
                  let sWorkingOnIt: string = this.m_oTranslate.instant(
                    'MONITOR.WORK_IN_PROGRESS'
                  );
                  let sWorkingOnItTitle: string = this.m_oTranslate.instant(
                    'MONITOR.WORK_IN_PROGRESS_TITLE'
                  );
                  //todo make notification type that only ask user for confirmation eg : I understand
                  this.m_oNotificationService.openInfoDialog(
                    sWorkingOnIt,
                    'alert',
                    sWorkingOnItTitle
                  );
                }
              }
            },
            error: (oError) => {
              console.error('Error fetching layer count for area', oError);
            }
          });
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(
          'Could not open area of operations',
          'danger',
          'Error'
        );
        this.m_oRouter.navigateByUrl('dashboard');
      },
    });
  }

  /**
   * Retrieve the list of the plugins active in the area
   * UC: RISE shows the Monitor Section containing options to show/hide the available layers
   * @param sAreaId
   * @returns void
   */
  getPluginsByArea(sAreaId: string): void {

    this.m_oPluginAPIService.getPluginsByArea(sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (oResponse.length > 0) {
          this.m_aoAreaPlugins = oResponse;
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(
          'Could not retrieve the information about the plugins associated with this area of operations.',
          'danger',
          'Error'
        );
      },
    });
  }

  /**
   * Method called to show/update a new layer on the map
   * @param oLayerMapViewModel
   * @returns
   */
  private showLayer(oLayerMapViewModel: any) {

    const oLeafLetMap = this.m_oMapService.getMap();
    const iIndex = this.m_aoLayers.findIndex(layer => layer.mapId === oLayerMapViewModel.mapId);
    let oExistingLayer = this.m_aoLayers.find(l => l.layerId === oLayerMapViewModel.layerId);

    //  Preserve opacity if it existed before
    oLayerMapViewModel.opacity = (typeof oExistingLayer?.opacity === 'number') ? oExistingLayer.opacity : 100;

    const bIsSameLayer = oExistingLayer &&
      oExistingLayer.layerId === oLayerMapViewModel.layerId &&
      oExistingLayer.referenceDate === oLayerMapViewModel.referenceDate &&
      oExistingLayer.geoserverUrl === oLayerMapViewModel.geoserverUrl;

    if (bIsSameLayer) {
      // Nothing changed: skip re-adding to the map so we can avoid the reorder issue
      return;
    }

    if (iIndex !== -1) {
      oLeafLetMap.eachLayer((oMapLayer) => {
        let sOldLayerId = this.m_aoLayers[iIndex].layerId;
        if (sOldLayerId === oMapLayer.options.layers) {
          oLeafLetMap.removeLayer(oMapLayer);
        }
      });

      this.m_aoLayers[iIndex] = oLayerMapViewModel;  // Replace existing
    }
    else {
      this.m_aoLayers.push(oLayerMapViewModel);     // Add new if not found
    }

    this.m_aoReversedLayers = [...this.m_aoLayers].reverse();

    this.m_oMapService.addLayerMap2DByServer(
      oLayerMapViewModel.layerId,
      oLayerMapViewModel.geoserverUrl,
      oLayerMapViewModel.opacity,

    );
    // Update the selected layers
    this.m_oMapService.setSelectedLayers(this.m_aoLayers)
  }


  private updateLayerList(oLayerMapVM:any) {

    // Check if it a layer already shown in the map
    let oExistingLayer = this.m_aoLayers.find(oThisLayer => oThisLayer.mapId === oLayerMapVM.mapId);

    // We do have it
    if (oExistingLayer) {
      // Double check also reference date and geoserver url
      const bIsSameLayer = oExistingLayer.referenceDate === oLayerMapVM.referenceDate
                        && oExistingLayer.geoserverUrl === oLayerMapVM.geoserverUrl
                        && oExistingLayer.layerId === oLayerMapVM.layerId;

      if (bIsSameLayer) {
        // Nothing changed: skip re-adding to the map so we can avoid the reorder issue
        return;
      }

      //  Preserve opacity if it existed before
      oLayerMapVM.opacity = (typeof oExistingLayer?.opacity === 'number') ? oExistingLayer.opacity : 100;

      // Do we have a layer of the same map already shown?
      const iIndex = this.m_aoLayers.findIndex(oThisLayer => oThisLayer.mapId === oLayerMapVM.mapId);

      if (iIndex !== -1) {
        const oLeafLetMap = this.m_oMapService.getMap();

        // Yes, we have this layer and is changed: remove old one from map
        oLeafLetMap.eachLayer((oMapLayer) => {
          let sOldLayerId = this.m_aoLayers[iIndex].layerId;
          if (sOldLayerId === oMapLayer.options.layers) {
            oLeafLetMap.removeLayer(oMapLayer);
          }
        });


        if (oLayerMapVM.disabled) {
          // The new one is disabled, remove from our active list
          this.m_aoLayers.splice(iIndex, 1);
        }
        else {
          // Replace existing in our active list
          this.m_aoLayers[iIndex] = oLayerMapVM;

          // Add the layer again to the map
          this.m_oMapService.addLayerMap2DByServer(
            oLayerMapVM.layerId,
            oLayerMapVM.geoserverUrl,
            oLayerMapVM.opacity,
          );
        }

        this.m_aoReversedLayers = [...this.m_aoLayers].reverse();
        // Update the selected layers
        this.m_oMapService.setSelectedLayers(this.m_aoLayers)

      }
    }

  }

  /**
   * Handle Changes to the Reference Time from the Timebar Component
   *  UC: RISE shows the Monitor Section containing a timeline to change the reference time of the viewer
   */
  getReferenceTime(oSelecteDateInfo:any): void {
    // oSelecteDateInfo.iReferenceTime is a Millisecond Timestamp.
    // This is safe to use directly.
    this.m_iSelectedDate = oSelecteDateInfo.iReferenceTime;
    this.m_bIsNavigatedFromEventList=!oSelecteDateInfo.bChangedByUser;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oSelecteDateInfo?.eventId)) {
      this.fillEventPanel(oSelecteDateInfo.eventId);

    }
    else if(!this.m_bIsNavigatedFromEventList){
        this.cleanEventPanel();
        this.clearImageMarkers();
    }
    this.clearImpactTableData();

    // Update the layers based on the new date
    this.updateMapAndLayerButtons();
  }

  /**
   * this method is made to enable/disable the plugins button
   * @param aoMaps
   */
  updateMapAndLayerButtons(){

    // Get the list of the map id of the layers currently shown on the map
    const asMapIds = this.m_aoLayers.map(oLayer => oLayer.mapId);
    const sMapIds = asMapIds.join(",");
    const sSelectedPluginId= this.m_oSelectedPlugin ? this.m_oSelectedPlugin.id : "";

    if(sMapIds!="" || sSelectedPluginId!=""){

      this.m_oLayerService.findAvailableLayers(sMapIds,this.m_sAreaId,this.m_iSelectedDate, sSelectedPluginId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next:(oResponse)=>{
          for (const oLayerMapVM of oResponse) {
            this.updateLayerList(oLayerMapVM);
          }

          // If we have a plugin selected, update the list of visible buttons
          if (sSelectedPluginId!="") {
            let aoNewVisibleButtons = [];
            for (let i=0;i<this.m_aoVisibleMapLayersButtons.length;i++) {
              for (let j=0;j<oResponse.length;j++) {
                if (this.m_aoVisibleMapLayersButtons[i].mapId === oResponse[j].mapId) {
                  aoNewVisibleButtons.push(oResponse[j]);
                }
              }
            }
            this.m_aoVisibleMapLayersButtons = aoNewVisibleButtons;
            this.logPluginImpactData(oResponse);
          }
        }
      });
    }
  }

  /**
   * Handle selection of a plugin in the first level menu
   * @param oPlugin - The plugin selected by the user
   */
  selectPlugin(oPlugin: any) {
    // Is it selected already?
    if (this.m_oSelectedPlugin) {
      // It is, toggle selection
      if (this.m_oSelectedPlugin.id === oPlugin.id) {
        this.m_oSelectedPlugin = null;
        this.clearImpactTableData();
      }
      else {
        this.m_oSelectedPlugin = oPlugin;
        this.clearImpactTableData();
      }
    }
    else {
      // It is not selected, select it
      this.m_oSelectedPlugin = oPlugin;
    }

    // Do we have a selected plugin?
    if (this.m_oSelectedPlugin) {
      // Get the plugins maps
      this.m_oLayerService.findAvailableLayers("",this.m_sAreaId,this.m_iSelectedDate,this.m_oSelectedPlugin.id).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {

          for (let i=0;i<oResponse.length;i++) {
            // Fix the loaded flag
            for (let j=0;j<this.m_aoLayers.length;j++) {
              if (this.m_aoLayers[j].mapId === oResponse[i].mapId) {
                oResponse[i].loaded = true;
              }
            }
          }

          this.m_aoVisibleMapLayersButtons = oResponse;
          this.logPluginImpactData(oResponse);
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(
            'Could not retrieve the information about the selected plugin.',
            'danger',
            'Error'
          );
        }
      });
    }
    else {
      // No selected plugin, clear visible maps
      this.m_aoVisibleMapLayersButtons = [];
    }
  }

  switchMapButton(oMapButton:any) {
    //was active,turn it to inactive
    if(oMapButton.disabled){
      return;
    }

    // Check if the Map is already shown
    if(oMapButton.loaded) {
      // Remove the layers from the map
      oMapButton.loaded = false;
      let oLeafLetMap=this.m_oMapService.getMap();

      oLeafLetMap.eachLayer((oMapLayer) => {
        let sLayerId = oMapButton.layerId;
        if (sLayerId === oMapLayer.options.layers) {
          oLeafLetMap.removeLayer(oMapLayer);
          let iIndex = this.m_aoLayers.findIndex(
            (oLayer) => oLayer.layerId === sLayerId
          );
          this.m_aoLayers.splice(iIndex, 1);
          this.m_aoReversedLayers=this.m_aoLayers;
        }
      });

    }
    else {
      //was inactive,turn it to active
      oMapButton.loaded = true;
      this.showLayer(oMapButton);

    }

  }

  /**
   * Scans a plugin's layers for vector/impact data and fetches their WFS tables
   */
  /**
   * Fetches impact layer features and populates the sidebar table
   */
  private logPluginImpactData(aoLayers: any[]): void {
    if (!aoLayers || aoLayers.length === 0) return;

    const aoImpactLayers = aoLayers.filter((oLayer: any) =>
        oLayer.layerId && (
          oLayer.layerId.includes('roads') ||
          oLayer.layerId.includes('exposure') ||
          oLayer.layerId.includes('markers')
        )
    );

    if (aoImpactLayers.length > 0) {

      // Reset data
      this.clearImpactTableData();
      // Store WFS reference for export
      const oFirstLayer = aoImpactLayers[0];
      this.m_sActiveImpactLayerId = oFirstLayer.layerId;
      this.m_sActiveImpactWfsUrl = oFirstLayer.geoserverUrl ? oFirstLayer.geoserverUrl.replace(/\/wms\b/i, '/wfs') : '';

      aoImpactLayers.forEach((oLayer: any) => {
        if (oLayer.geoserverUrl) {
          this.m_oLayerService.getLayerTableDataWFS(oLayer.geoserverUrl, oLayer.layerId)
            .subscribe({
              next: (aoTableProps: any[]) => {
                // Normalize properties into name & type format
                const aoParsedRows = aoTableProps.map((props: any) => {
                  const sName = props.name || props.NAME || props.road_name || props.id || props.ID || 'Unnamed Feature';
                  const sType = props.type || props.TYPE || props.category || props.CLASS || props.fclass || (oLayer.layerId.includes('roads') ? 'Road' : 'Exposure');
                  return { name: sName, type: sType, raw: props };
                });

                this.m_aoImpactTableData = [...this.m_aoImpactTableData, ...aoParsedRows];

                // Extract unique types for dropdown filter
                const setTypes = new Set(this.m_aoImpactTableData.map(item => item.type));
                this.m_asImpactTypes = Array.from(setTypes).sort();

                this.applyImpactTypeFilter();
              },
              error: (oError: any) => {
                console.error(`WFS Error for ${oLayer.layerId}:`, oError);
              }
            });
        }
      });
    }
  }

  /**
   * Filter table rows based on selected dropdown type
   */
  public applyImpactTypeFilter(): void {
    const oCounts = new Map<string, number>();
    this.m_aoImpactTableData.forEach(oItem => {
      oCounts.set(oItem.type, (oCounts.get(oItem.type) || 0) + 1);
    });
    this.m_aoImpactSummary = Array.from(oCounts, ([type, count]) => ({ type, count }))
      .sort((oLeft, oRight) => oLeft.type.localeCompare(oRight.type));

    if (this.m_sSelectedTypeFilter === 'ALL' || !this.m_sSelectedTypeFilter) {
      this.m_aoFilteredImpactTableData = [...this.m_aoImpactTableData];
    } else {
      this.m_aoFilteredImpactTableData = this.m_aoImpactTableData.filter(
        item => item.type === this.m_sSelectedTypeFilter
      );
    }

    // Re-apply current sort to the newly filtered data
    // Temporarily flip the boolean so calling sortTable doesn't reverse the user's preference
    this.m_bSortAscending = !this.m_bSortAscending;
    this.sortTable(this.m_sSortColumn);
  }

  /**
   * Directly downloads CSV from GeoServer WFS
   */
  public exportImpactsToCSV(): void {
    if (!this.m_sActiveImpactWfsUrl || !this.m_sActiveImpactLayerId) {
      return;
    }
    const sCsvUrl = `${this.m_sActiveImpactWfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${this.m_sActiveImpactLayerId}&outputFormat=csv`;
    window.open(sCsvUrl, '_blank');
  }

  /**
   * Clears the impact table data and hides the UI container
   */
  public clearImpactTableData(): void {
    this.m_aoImpactTableData = [];
    this.m_aoFilteredImpactTableData = [];
    this.m_aoImpactSummary = [];
    this.m_asImpactTypes = [];
    this.m_sSelectedTypeFilter = 'ALL';
    this.m_sActiveImpactLayerId = '';
    this.m_sActiveImpactWfsUrl = '';
  }

  /********** DRAG AND DROP CAPABILITIES **********/
  /**
   * Handles the list item dropping
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.m_aoReversedLayers, event.previousIndex, event.currentIndex);
    this.handleLayerOrder();
  }

  /**
   * When the layer order changes, manually remove and then re-add the layers
   */
  handleLayerOrder(): void {
    let aoOrderedLayers = [...this.m_aoReversedLayers].reverse();
    console.log(aoOrderedLayers)
    aoOrderedLayers.forEach((oLayer) => {
      let oMap = this.m_oMapService.getMap();
      oMap.eachLayer((oMapLayer) => {
        if (oLayer.layerId === oMapLayer.options.layers) {
          oMap.removeLayer(oMapLayer);
        }
      });
    });

    aoOrderedLayers.forEach((oLayer) => {
      this.m_oMapService.addLayerMap2DByServer(
        oLayer.layerId,
        oLayer.geoserverUrl,
        oLayer.opacity
      );
    });

    this.m_aoLayers = aoOrderedLayers;
    this.m_aoReversedLayers = [...this.m_aoLayers].reverse();
  }

  /********** LAYER LIST ITEM HANDLERS **********/


  handleLayerAction(oEvent) {
    switch (oEvent.action) {
      case 'download':
        this.downloadLayer(oEvent.layer.id, "geotiff");
        break;
      case 'remove':
        this.removeLayer(oEvent.layer);
        break;
      case 'zoomTo':
        this.zoomToLayer(oEvent.layer);
        break;
      case 'properties':
        this.openPropertiesLayer(oEvent.layer);
        break;
    }
  }

  getLayerVisibility(bIsVisible, oLayer) {
    let iOpacity;
    bIsVisible ? (iOpacity = 100) : (iOpacity = 0);
    this.setOpacity(iOpacity, oLayer.layerId);
  }

  setOpacity(iValue, sLayerId): void {
    let iOpacity = iValue;
    let oMap = this.m_oMapService.getMap();
    let fPercentage = iOpacity / 100;
    const oLayerInMain = this.m_aoLayers.find((o) => o.layerId === sLayerId);
    if (oLayerInMain) {
      oLayerInMain.opacity = iValue;
    }

    // Update opacity in m_aoReversedLayers
    const oLayerInReversed = this.m_aoReversedLayers.find((o) => o.layerId === sLayerId);
    if (oLayerInReversed) {
      oLayerInReversed.opacity = iValue;
    }

    oMap.eachLayer(function (layer) {
      if (
        layer.options.layers == 'wasdi:' + sLayerId ||
        layer.options.layers == sLayerId
      ) {
        layer.setOpacity(fPercentage);
      }
    });
  }

  getOpacity(sLayerId): number {
    let oMap = this.m_oMapService.getMap();
    let opacity = 0; // Default opacity

    oMap.eachLayer((layer) => {
      if (
        layer.options?.layers === 'wasdi:' + sLayerId ||
        layer.options?.layers === sLayerId
      ) {
        opacity=layer.options.opacity

      }
    });

    return opacity;
  }


  removeLayer(oEvent) {
    let oMap = this.m_oMapService.getMap();
    // Remove from general
    let iIndex = this.m_aoLayers.findIndex(
      (oLayer) => oLayer.layerId === oEvent.layerId
    );
    this.emptyPluginLayers(oEvent.mapId);

    this.m_aoLayers.splice(iIndex, 1);
    oMap.eachLayer((oLayer) => {
      let sLayer = oLayer.options.layers;
      if (sLayer === oEvent.layerId) {
        oMap.removeLayer(oLayer);
      }
    });
    this.m_aoReversedLayers=this.m_aoLayers.reverse();
    // Update the selected layers

    this.m_oMapService.setSelectedLayers(this.m_aoLayers);
  }

  zoomToLayer(oEvent) {
    this.m_oMapService.flyToMonitorBounds(this.m_oAreaOfOperation.bbox);
  }

  emptyPluginLayers(sPluginId: string) {
    this.m_aoVisibleMapLayersButtons.forEach((oPlugin) => {
      if(oPlugin.id === sPluginId ){
        if(oPlugin.loaded){
          oPlugin.loaded = false;
        }
        oPlugin.layers=[];
      }
    });
  }

  cleanEventPanel() {
    this.m_bShowEventInfo=false;
    this.m_oSelectedEvent={};
    this.m_asEventImages = [];
    this.m_asEventDocs = [];
    this.m_aoAllFiles = [];          // NEW
    this.m_asOriginalAllFiles = [];  // NEW
  }

  fillEventPanel(sEventId:string) {

    for (let i = 0; i < this.m_aoEvents.length; i++) {
      if (this.m_aoEvents[i].id === sEventId) {
        this.m_oSelectedEvent = this.m_aoEvents[i];
        this.m_bShowEventInfo = true;
        this.loadEventAttachments(sEventId)
        break;
      }
    }
  }

  loadEventAttachments(sEventId: string) {
    this.m_aoAllFiles = [];
    this.m_asOriginalAllFiles = [];

    // FIX: Clear markers ONCE at the top to prevent async race conditions!
    this.m_aoEventImageMarkers = [];

    // 1. FOR IMAGES/VIDEOS:
    this.m_oAttachmentService.list("event_images", sEventId).subscribe({
      next: (oResponse) => {
        this.m_asEventImages = oResponse.files || [];

        for (let i = 0; i < oResponse.files.length; i++) {
          let sFileName = oResponse.files[i];
          let bIsVideo = sFileName.toLowerCase().endsWith('.mp4') || sFileName.toLowerCase().endsWith('.mov') || sFileName.toLowerCase().endsWith('.avi');
          let sType = bIsVideo ? 'video' : 'image';

          this.m_asOriginalAllFiles.push({ name: sFileName, type: sType });

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
    this.m_oAttachmentService.list("event_docs", sEventId).subscribe({
      next: (oResponse) => {
        this.m_asEventDocs = oResponse.files || [];

        for (let i = 0; i < oResponse.files.length; i++) {
          let sFileName = oResponse.files[i];
          let bIsVideo = sFileName.toLowerCase().endsWith('.mp4') || sFileName.toLowerCase().endsWith('.mov') || sFileName.toLowerCase().endsWith('.avi');
          let sType = bIsVideo ? 'video' : 'doc';

          this.m_asOriginalAllFiles.push({ name: sFileName, type: sType });

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

    if (this.m_aoEventImageMarkers.length === 0)  {
      return;
    }

    const oMap = this.m_oMapService.getMap();
    this.m_oImageMarkersLayer = L.layerGroup().addTo(oMap);

    this.m_aoEventImageMarkers.forEach(oMarker => {

      // Dynamically pick the icon and color based on the file type!
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

      // Pass the whole object to previewFile so it routes docs/images correctly
      oImageMarkerLeaflet.on('click', () => {
        this.previewFile({ name: oMarker.fileName, type: oMarker.type || 'image' });
      });

      oImageMarkerLeaflet.bindTooltip(oMarker.fileName, {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
      });

      this.m_oImageMarkersLayer.addLayer(oImageMarkerLeaflet);
    });
  }

  // --- Unified Sorting Methods ---
  applyFileSort() {
    let copy = [...this.m_asOriginalAllFiles];
    if (this.m_sFilesSortType === 'oldest') {
      this.m_aoAllFiles = copy;
    } else if (this.m_sFilesSortType === 'newest') {
      this.m_aoAllFiles = copy.reverse();
    } else if (this.m_sFilesSortType === 'az') {
      this.m_aoAllFiles = copy.sort((a,b) => a.name.localeCompare(b.name));
    } else if (this.m_sFilesSortType === 'za') {
      this.m_aoAllFiles = copy.sort((a,b) => b.name.localeCompare(a.name));
    }
  }

  toggleTimeSort() {
    this.m_sFilesSortType = this.m_sFilesSortType === 'oldest' ? 'newest' : 'oldest';
    this.applyFileSort();
  }

  toggleAlphaSort() {
    this.m_sFilesSortType = this.m_sFilesSortType === 'az' ? 'za' : 'az';
    this.applyFileSort();
  }


  clearImageMarkers(): void {
    if (this.m_oImageMarkersLayer) {
      const oMap = this.m_oMapService.getMap();
      oMap.removeLayer(this.m_oImageMarkersLayer);
      this.m_oImageMarkersLayer = null;
    }
  }



  onPreviewImage(sFileName: string) {
    if (sFileName) {

      let sLink = this.m_oAttachmentService.getAttachmentLink("event_images", this.m_oSelectedEvent.id, sFileName)

      let oPayload =
      {
        fileName: sFileName,
        link: sLink,
        type: "image",
        eventId: this.m_oSelectedEvent.id
      }

      // Open the Material Dialog with the image
      const oPreviewDialogRef = this.m_oImageDialog.open(ImageDialogComponent, {
        data: { oPayload },
        width: '98vw',
        height: '98vh',
        maxWidth: '98vw',
        maxHeight: '98vh'
      });

      // Handle dialog close event
      oPreviewDialogRef.afterClosed().subscribe(result => {
        this.loadEventAttachments(this.m_oSelectedEvent.id);
      });

    }
  }

  onPreviewDoc(sFileName: string) {
    if (sFileName) {

      let sLink = this.m_oAttachmentService.getAttachmentLink("event_docs", this.m_oSelectedEvent.id, sFileName)

      let sType = "txt";

      if (sFileName.toLowerCase().endsWith('.pdf') || sFileName.toLowerCase().endsWith('.docx') || sFileName.toLowerCase().endsWith('.doc')) {
        sType = "pdf";
      }

      let oPayload =
      {
        fileName: sFileName,
        link: sLink,
        type: sType,
        eventId: this.m_oSelectedEvent.id
      }

      // Open the Material Dialog with the image
      const oPreviewDialogRef = this.m_oImageDialog.open(ImageDialogComponent, {
        data: { oPayload },
        width: '98vw',
        height: '98vh',
        maxWidth: '98vw',
        maxHeight: '98vh'
      });

      // Handle dialog close event
      oPreviewDialogRef.afterClosed().subscribe(result => {
        this.loadEventAttachments(this.m_oSelectedEvent.id);
      });
    }
  }

  handleLiveButtonPressed(bIsLive) {
    this.m_bIsLive = bIsLive;

    if(this.m_bIsLive){
      // Clean the event panel if we go live
      this.cleanEventPanel();

      // Clear image markers when going live
      this.clearImageMarkers();

      // Re-start the timer
      this.startLiveTimer();

      // Update current date immediately
      this.m_iCurrentDate = this.getCurrentDate();

      // Show closest layer to live date
      if (this.m_aoLayers && this.m_aoLayers.length > 0) {

        this.setOpacity(100, this.m_aoLayers[0].layerId);

        for (let i = 1; i < this.m_aoLayers.length; i++) {
          this.setOpacity(0, this.m_aoLayers[i].layerId);
        }
      }
    }
    else {
      this.stopLiveTimer();
    }
  }

  async handlePlayButtonPressed(sSelectedDate) {
    //todo show  layer gradually from selected date to newest date
    if (this.m_aoLayers && this.m_aoLayers.length > 0) {
      const aoSortedLayers = this.m_aoLayers.sort((a, b) => a.referenceDate - b.referenceDate);
      // Store initial opacities
      const m_oInitialOpacities = new Map();
      aoSortedLayers.forEach(layer => {
        const iInitialOpacity = this.getOpacity(layer.layerId);
        m_oInitialOpacities.set(layer.layerId, iInitialOpacity);
      });
      //setting every layer to 0
      for (const aoSortedLayer of aoSortedLayers) {
        this.setOpacity(0,aoSortedLayer.layerId);
      }
      //animation :showing layer by layer
      for (const aoSortedLayer of aoSortedLayers) {
        // Show the current aoSortedLayer
        this.setOpacity(100, aoSortedLayer.layerId);
        // Wait for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Hide the current aoSortedLayer
        this.setOpacity(0,aoSortedLayer.layerId);

      }
      // go back to initial point
      for (const aoSortedLayer of aoSortedLayers) {
        const iInitialOpacity = m_oInitialOpacities.get(aoSortedLayer.layerId) || 0;
        this.setOpacity(iInitialOpacity * 100, aoSortedLayer.layerId);

      }
    }
  }

  private downloadLayer(sLayerId, sFormat: string) {
    this.m_oLayerService.downloadLayer(sLayerId, sFormat).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse: Blob) => {
        const blob = new Blob([oResponse], {type: oResponse.type});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sLayerId}.${sFormat}`; // Set the filename dynamically
        a.click();
        window.URL.revokeObjectURL(url); // Clean up the URL object
      },
      error: (err) => {
        console.error('Error downloading layer:', err);
      }
    });
  }

  private openPropertiesLayer(layer) {

    this.m_oDialog.open(LayerPropertiesComponent, {
      data: layer
    }).afterClosed().subscribe(() => {
      //nothing to  do
    });

  }

  private openLayerAnalyzerDialog() {

    let aoSelectedLayers = this.m_oMapService.getSelectedLayers();
    let oAOIBbox = this.m_oMapService.getMagicToolAOI();
    //console.log(aoSelectedLayers)

    this.m_oDialog.open(LayerAnalyzerComponent,
      {
        data: {
          selectedLayers: aoSelectedLayers,
          aoiBbox: oAOIBbox
        }
      }
    ).afterClosed().subscribe(() => {
    })
  }

  /**
   * Handle routing on clicks of visible buttons
   */
  public navigateRoute(sLocation: string) {
    if (sLocation === 'dashboard') {
      this.m_oMapService.closeWorkspace();
    }
    if(sLocation==='events'){
      if(this.m_sAreaId){
        this.m_oRouter.navigateByUrl(`/events/${this.m_sAreaId}`)
      }
      else{
        console.error("Area id is missing")
        //todo show notification
      }
    }else{
      this.m_oRouter.navigateByUrl(`/${sLocation}`);
    }

  }

  private getEvents() {
    if(this.m_sAreaId){
      this.m_oEventService.getEvents(this.m_sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next:(aoEventsVM)=>{
            this.m_aoEvents=aoEventsVM
        },
        error:(oError)=>{
          console.error(oError)
        }
      })
    }

  }

  getVisibleMapButtons() {
    return this.m_bShowAllMaps
      ? this.m_aoVisibleMapLayersButtons
      : this.m_aoVisibleMapLayersButtons.slice(0, this.m_iVisibleCount);
  }

  getHiddenMapButtonsCount(): number {
    const visiblePlugins = this.getVisibleMapButtons();
    return this.m_aoVisibleMapLayersButtons.length - visiblePlugins.length;
  }

  togglePluginView() {
    this.m_bShowAllMaps = !this.m_bShowAllMaps;
  }

  /*
    Given an area id and selected date , we show Impacts
    */
  openImpacts() {

    const oDialogData = {
      areaId: this.m_sAreaId,
      selectedDate: this.m_iSelectedDate,
      areaName: this.m_sAreaName
    }

    this.m_oDialog.open(ImpactsDialogComponent, {
      data: oDialogData
    }).afterClosed().subscribe(()=>{

      }
    )
  }

  handleMeasurementTool(sWkt:any){
    console.log(sWkt);
    if(sWkt){
      this.m_sMeasurementToolWkt=sWkt;
      console.log(this.m_sMeasurementToolWkt);
    }else{
      this.m_sMeasurementToolWkt=null;
    }
  }

  onPrintButtonClick(){
    let aoLayersForPrint=[];
    for (let i = 0; i <this.m_aoLayers.length ; i++) {
      let oLayer = this.m_aoLayers[i];
      let oLayerToPrint={layerId:oLayer.layerId,wmsUrl:oLayer.geoserverUrl,name:oLayer.mapId}
      aoLayersForPrint.push(oLayerToPrint);
    }
    let oPrintPayload={
      baseMap:this.m_oMapService.getActiveLayer()._url,
      zoomLevel:this.m_oMapService.getMap().getZoom(),
      center:this.m_oMapService.getMap().getCenter(),
      format:"",
      wmsLayers:aoLayersForPrint,
      wkts:this.m_sMeasurementToolWkt?[{name:"drawn area",geom:this.m_sMeasurementToolWkt}]:[]
    }
    const oDialogRef = this.m_oDialog.open(PrintMapDialogComponent, {
      data: { payload: oPrintPayload,areaName:this.m_sAreaName }
    });

    oDialogRef.afterClosed().subscribe(result => {
      if (result ) {
        console.log('User confirmed print with options:', result);
      }
    });
  }
}
