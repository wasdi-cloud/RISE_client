import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

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
import {log} from "node:util";
import {ImpactsDialogComponent} from "../../dialogs/impacts-dialog/impacts-dialog.component";
import {Subscription} from "rxjs";


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

  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css',
})
export class MonitorComponent implements OnInit,AfterViewInit,OnDestroy {

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
   * Button objects corresponding to possible plugin layers
   */
  m_aoButtons = LayerTypes;

  /**
   * Archive start date
   */
  m_sStartDate: any = null;

  /**
   * Archive end date
   */
  m_sEndDate: any = null;

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
  m_aoPlugins: Array<any> = [];

  /**
   * Active Plugin Object
   */
  m_oActivePlugin: any = null;

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
   * List of Event documents
   */
  m_asEventDocs: string[] = [];

  m_iInitialPeakDate: number;
  m_iVisibleCount = 5;
  m_bShowAllPlugins = false;

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
     * a flag to distinguish going to event from the event page or click on the event marker
     */
  private m_bIsNavigatedFromEventList = false;
    @ViewChild('btnContainer', { static: false }) btnContainerRef!: ElementRef;
    @ViewChild('tempFix', { static: false }) tempFixRef!: ElementRef;
    private m_bIsLive: boolean=true;
  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAreaService: AreaService,
    private m_oConstantsService: ConstantsService,
    private m_oLayerService: LayerService,
    private m_oMapAPIService: MapAPIService,
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

    if (state?.peakDate) {
      this.m_bIsNavigatedFromEventList=true;
      this.m_oSelectedEvent.endDate=(Number(state?.endDate));
      this.m_oSelectedEvent.startDate=(Number(state?.startDate));
      this.m_oSelectedEvent.peakDate=(Number(state?.peakDate));
      this.m_oSelectedEvent.type=state?.type;
      this.m_oSelectedEvent.name=state?.name;
      this.m_oSelectedEvent.id=state?.id;

      this.loadEventAttachments(this.m_oSelectedEvent.id);

      this.m_bShowEventInfo=true;

      // Convert peakDate to milliseconds and create a Date object
      const iPeakDateInSeconds = Number(state?.peakDate);
      const oPeakDate = new Date(iPeakDateInSeconds * 1000);

      // Ensure the date is at the end of the day
      const oAdjustedDate = new Date(
        oPeakDate.getFullYear(),
        oPeakDate.getMonth(),
        oPeakDate.getDate(),
        23, 59, 59, 0
      );

      let iFinalTimestampMs = oAdjustedDate.getTime(); // Convert to seconds

      this.m_iSelectedDate= iFinalTimestampMs;
      this.m_iInitialPeakDate = iFinalTimestampMs/1000;
    }
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
        this.openLayerAnalyzerDialog(); // Your dialog opening method
      }
    });

    // Get the list of events of the area
    this.getEvents()
  }

  ngAfterViewInit(): void {
    document.addEventListener('fullscreenchange', () => {

      const oFullscreenElement = document.fullscreenElement;
      const oBtnContainer = this.btnContainerRef.nativeElement;
      const oOriginalParent = this.tempFixRef.nativeElement;

      const sFullscreenClass = 'fullscreen-btn-container'; // This will be the class for fullscreen mode
      const sNormalClass = 'btn-select-container'; // This will be the class for fullscreen mode

      // Add or remove the fullscreen class based on the fullscreen state
      if (oFullscreenElement && !oFullscreenElement.contains(oBtnContainer)) {
        oFullscreenElement.appendChild(oBtnContainer);
        oBtnContainer.classList.add(sFullscreenClass);
        oBtnContainer.classList.remove(sNormalClass);
      }
      else if (!oFullscreenElement) {
        oOriginalParent.insertBefore(oBtnContainer, oOriginalParent.firstChild);
        oBtnContainer.classList.remove(sFullscreenClass);
        oBtnContainer.classList.add(sNormalClass);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopLiveTimer();
    // Unsubscribe when the component is destroyed
    if (this.m_oLayerAnalyzerSubscription) {
      this.m_oLayerAnalyzerSubscription.unsubscribe();
    }
  }

  startLiveTimer() {
    this.stopLiveTimer(); // clear any existing interval

    this.m_oLiveTimer = setInterval(() => {
      if (this.m_bIsLive) {
        this.m_iCurrentDate = this.getCurrentDate();
      }
    }, 0.5 * 60 * 1000); // every 5 minutes
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
    this.m_oAreaService.getAreaById(sAreaId).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oAreaOfOperation = oResponse;
          this.m_sAreaName = this.m_oAreaOfOperation.name;
          this.m_oConstantsService.setActiveArea(this.m_oAreaOfOperation);

          this.getMapsByArea(oResponse.id, oResponse.startDate);
          this.m_oMapService.flyToMonitorBounds(oResponse.bbox);

          if (!this.m_oAreaOfOperation.firstShortArchivesReady) {

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

          this.m_oEventService.getEvents(sAreaId).subscribe(
            {
              next:(oResponse)=>{
                this.m_aoEvents=oResponse;
              }
            }
          )
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
   * Retrieve the plugin details from the server
   * UC: RISE shows the Monitor Section containing options to show/hide the available layers
   * @param sAreaId
   * @param iAreaDate
   * @returns void
   */
  getMapsByArea(sAreaId: string, iAreaDate?: string | number): void {
    if (!iAreaDate) {
      iAreaDate = '';
    }
    this.m_oMapAPIService.byArea(sAreaId).subscribe({
      next: (oResponse) => {
        if (oResponse.length > 0) {
          this.m_aoPlugins = oResponse;
          // this.m_aoPlugins.forEach((oPlugin) => {
          //   if (this.m_aoPlugins[0].name === oPlugin.name) {
          //     this.m_oActivePlugin = this.m_aoPlugins[0];
          //   }
          // });
          this.initPluginsButtons(this.m_aoPlugins);
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
   * Get the layer for the selected type from the button execution
   * UC: RISE shows the Monitor Section containing options to show/hide the available layers
   * @param oPlugin
   * @param sAreaId
   * @param iDate
   */
  getLayer(oPlugin: any, sAreaId: string, iDate: string | number) {

    this.m_oLayerService.findLayer(oPlugin.id, sAreaId, this.m_iSelectedDate).subscribe({
        next: (oLayerVM:LayerViewModel) => {

          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayerVM)) {
            this.fillPluginsAndLayers(oPlugin, oLayerVM);
          }
          else {
            oPlugin.loaded = false;
            const oMap = this.m_oMapService.getMap();
            oPlugin.layers.forEach(layer => {
              oMap.eachLayer(oMapLayer => {
                if (oMapLayer.options.layers === layer.layerId) {
                  oMap.removeLayer(oMapLayer);
                }
              });

              // Remove from this.m_aoLayers
              this.m_aoLayers = this.m_aoLayers.filter(l => l.layerId !== layer.layerId);
              this.m_aoReversedLayers = [...this.m_aoLayers]
            });
            oPlugin.layers=[]

            // this.m_oActivePlugin=null;
          }
        },
        error: (oError) => {
          let sError: string = this.m_oTranslate.instant(
            'ERROR_MSG.ERROR_LAYER_FAILURE'
          );
          let sErrorMessage=sError.concat(oPlugin.name?oPlugin.name:"this plugin");

          this.m_oNotificationService.openInfoDialog(sErrorMessage, 'error', 'Error');
        },
      });
  }

  private fillPluginsAndLayers(oPlugin: any, oLayer:LayerViewModel) {
    const oMap = this.m_oMapService.getMap();
    const iIndex = this.m_aoLayers.findIndex(layer => layer.mapId === oLayer.mapId);
    let oExistingLayer = this.m_aoLayers.find(l => l.layerId === oLayer.layerId);
    oLayer.pluginName=oPlugin.name;

    //  Preserve opacity if it existed before
    oLayer.opacity = (typeof oExistingLayer?.opacity === 'number') ? oExistingLayer.opacity : 100;

    const bIsSameLayer = oExistingLayer &&
      oExistingLayer.layerId === oLayer.layerId &&
      oExistingLayer.referenceDate === oLayer.referenceDate &&
      oExistingLayer.geoserverUrl === oLayer.geoserverUrl;

    if (bIsSameLayer) {
      // Nothing changed: skip re-adding to the map so we can avoid the reorder issue
      return;
    }

    if (iIndex !== -1) {
      oMap.eachLayer((oMapLayer) => {
        let sOldLayerId = this.m_aoLayers[iIndex].layerId;
        if (sOldLayerId === oMapLayer.options.layers) {
          oMap.removeLayer(oMapLayer);
        }
      });

      this.m_aoLayers[iIndex] = oLayer;  // Replace existing
    }
    else {
      this.m_aoLayers.push(oLayer);     // Add new if not found
    }

    // Check if oPlugin.layers already contains the object
    if (!oPlugin.layers.some(oLayer => oLayer.layerId === oLayer.layerId)) {
      oPlugin.layers.push(oLayer);
    }

    //sort the layers
    //this.m_aoLayers = this.m_aoLayers.sort((a, b) => a.referenceDate - b.referenceDate);

    this.m_aoReversedLayers = [...this.m_aoLayers].reverse();

    this.m_oMapService.addLayerMap2DByServer(
      oLayer.layerId,
      oLayer.geoserverUrl,
      oLayer.opacity,

    );
    // Update the selected layers
    this.m_oMapService.setSelectedLayers(this.m_aoLayers)
  }

  /**
   * Handle Changes to the Reference Time from the Timebar Component
   *  UC: RISE shows the Monitor Section containing a timeline to change the reference time of the viewer
   */
  getReferenceTime(oSelecteDateInfo:any): void {
    this.m_iSelectedDate = oSelecteDateInfo.iReferenceTime;
    this.m_bIsNavigatedFromEventList=!oSelecteDateInfo.bChangedByUser;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oSelecteDateInfo?.eventId)) {
      this.fillEventPanel(oSelecteDateInfo.eventId);

    }else if(!this.m_bIsNavigatedFromEventList){
        this.cleanEventPanel();
    }
    this.initPluginsButtons(this.m_aoPlugins);

    this.m_aoPlugins.forEach((oPlugin) => {
      if (oPlugin.loaded) {
        this.getLayer(oPlugin, this.m_sAreaId, this.m_iSelectedDate);
      }
    });

  }

  switchPluginButton(oPlugin:any) {
    //was active,turn it to inactive
    if(oPlugin.disabled){
      return;
    }

    // Check if the plugin (Map indeed) is already loaded
    if(oPlugin.loaded) {
      // Remove the layers from the map
      oPlugin.loaded = false;
      let oMap=this.m_oMapService.getMap();

      for (let i=0;i<oPlugin.layers.length;i++) {

        oMap.eachLayer((oMapLayer) => {
          let sLayerId = oPlugin.layers[i].layerId;
          if (sLayerId === oMapLayer.options.layers) {
            oMap.removeLayer(oMapLayer);
            let iIndex = this.m_aoLayers.findIndex(
              (oLayer) => oLayer.layerId === sLayerId
            );
            this.m_aoLayers.splice(iIndex, 1);
            this.m_aoReversedLayers=this.m_aoLayers;
          }
        });
      }
      oPlugin.layers=[]
    }
    else {
      //was inactive,turn it to active

      oPlugin.loaded = true;

      if (!oPlugin.layers || oPlugin.layers.length < 1) {
        oPlugin.layers = []; //Init layers array in plugin to hold it after loading
        this.getLayer(oPlugin, this.m_sAreaId, '');

      }
    }

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
    //TODO: Add Geoserver bounding box to response (?)
    // this.m_oMapService.zoomBandImageOnGeoserverBoundingBox()

    let oMap = this.m_oMapService.getMap();

    this.m_oMapService.flyToMonitorBounds(this.m_oAreaOfOperation.bbox);
  }

  emptyPluginLayers(sPluginId: string) {
    this.m_aoPlugins.forEach((oPlugin) => {
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

  loadEventAttachments(sEventId:string) {
    this.m_oAttachmentService.list("event_images", sEventId).subscribe({
      next: (oResponse) => {
        this.m_asEventImages = oResponse.files;
      },
      error: (oError) => {
        console.error("Error loading image attachment", oError);
      }
    });

    this.m_oAttachmentService.list("event_docs", sEventId).subscribe({
      next: (oResponse) => {
        this.m_asEventDocs = oResponse.files;
      },
      error: (oError) => {
        console.error("Error loading document attachment", oError);
      }
    });
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
        width: '90vw'
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
        width: '90vw'
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

      // Re-start the timer
      this.startLiveTimer();

      // Update current date and end date immediately
      this.m_iCurrentDate = this.getCurrentDate();
      this.m_sEndDate = new Date(this.m_iCurrentDate * 1000).toISOString(); // Store as ISO string if expected

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
    this.m_oLayerService.downloadLayer(sLayerId, sFormat).subscribe({
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
      //don't know what will we do
    });

  }

  private openLayerAnalyzerDialog() {

    let aoSelectedLayers = this.m_oMapService.getSelectedLayers();
    let oAOIBbox = this.m_oMapService.getMagicToolAOI();

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
      }else{
        console.error("Area id is missing")
        //todo show notification
      }
    }else{
      this.m_oRouter.navigateByUrl(`/${sLocation}`);
    }

  }

  private getEvents() {
    if(this.m_sAreaId){
      this.m_oEventService.getEvents(this.m_sAreaId).subscribe({
        next:(aoEventsVM)=>{

            this.m_aoEvents=aoEventsVM
        },
        error:(oError)=>{
          console.error(oError)
        }
      })
    }

  }

  getVisiblePlugins() {
    return this.m_bShowAllPlugins
      ? this.m_aoPlugins
      : this.m_aoPlugins.slice(0, this.m_iVisibleCount);
  }

  getHiddenPluginsCount(): number {
    const visiblePlugins = this.getVisiblePlugins();
    return this.m_aoPlugins.length - visiblePlugins.length;
  }


  togglePluginView() {
    this.m_bShowAllPlugins = !this.m_bShowAllPlugins;
  }
  /*
  this method is made to enable/disable the plugins button
   */

  initPluginsButtons(aoPlugins: any[]){

    for (const oPlugin of aoPlugins) {
      this.m_oLayerService.findLayer(oPlugin.id,this.m_sAreaId,this.m_iSelectedDate).subscribe({
        next:(oResponse)=>{
          oPlugin.disabled = FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse);

        }
      })

    }
  }
    /*
     Given an area id and selected date , we show Impacts
     */
    openImpacts() {
      this.m_oDialog.open(ImpactsDialogComponent).afterClosed().subscribe(
        ()=>{
          console.log("imapcts works")
        }
      )
    }
  }
