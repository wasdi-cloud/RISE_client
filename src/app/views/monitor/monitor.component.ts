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
import {ImpactsDialogComponent} from "../../dialogs/impacts-dialog/impacts-dialog.component";
import {Subscription} from "rxjs";
import {PrintMapDialogComponent} from "../../dialogs/print-map-dialog/print-map-dialog.component";
import { PluginService } from '../../services/api/plugin.service';
import e from 'express';

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
    console.log("destroyed!")
    // IMPORTANT: Remove the fullscreenchange event listener
    document.removeEventListener('fullscreenchange', this.m_oFullscreenChangeListener);
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
    this.m_oAreaService.getAreaById(sAreaId).subscribe({

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

          // Check if there is at least some maps to show
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

    this.m_oPluginAPIService.getPluginsByArea(sAreaId).subscribe({
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

  private fillPluginsAndLayers(oPlugin: any, oLayer:LayerViewModel) {
    const oLeafLetMap = this.m_oMapService.getMap();
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
      oLeafLetMap.eachLayer((oMapLayer) => {
        let sOldLayerId = this.m_aoLayers[iIndex].layerId;
        if (sOldLayerId === oMapLayer.options.layers) {
          oLeafLetMap.removeLayer(oMapLayer);
        }
      });

      this.m_aoLayers[iIndex] = oLayer;  // Replace existing
    }
    else {
      this.m_aoLayers.push(oLayer);     // Add new if not found
    }

    // Check if oPlugin.layers already contains the object
    //todo so ugly , and must be one layer not layers and also get rid of the any type :'(
    if (!oPlugin.layers.some(oPluginLayer => oPluginLayer.layerId === oLayer.layerId)) {
      oPlugin.layers[0]=oLayer;
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

    // TODO: Update the layers based on the new date
    //this.initMapButtons(this.m_aoVisibleMapLayersButtons);
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
      }
      else {
        this.m_oSelectedPlugin = oPlugin;
      }
    }
    else {
      // It is not selected, select it
      this.m_oSelectedPlugin = oPlugin;
    }

    // Do we have a selected plugin?
    if (this.m_oSelectedPlugin) {
      // Get the plugins maps
      this.m_oLayerService.findAvailableLayers("",this.m_sAreaId,this.m_iSelectedDate,this.m_oSelectedPlugin.id).subscribe({ 
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

  /**
   * this method is made to enable/disable the plugins button
   * @param aoMaps 
   */
  initMapButtons(aoMaps: any[]){

    let asAvailableMapIds=[]

    const asMapIds = aoMaps.map(oMap => oMap.id);
    const sMapIds = asMapIds.join(","); // e.g., "map1,map2,map3"

    if(sMapIds){
      
      this.m_oLayerService.findAvailableLayers(sMapIds,this.m_sAreaId,this.m_iSelectedDate, "").subscribe({

        next:(oResponse)=>{
          for (const oResponseEle of oResponse) {
            this.fillPluginsAndLayers(aoMaps.find(oPlugin=>oPlugin.id===oResponseEle.mapId), oResponseEle);
            asAvailableMapIds.push(oResponseEle);
          }
          for (const oPlugin of aoMaps) {
            oPlugin.disabled=!asAvailableMapIds.includes(oPlugin.id)
          }
        }
      })
    }
  }

    /**
   * this method is made to enable/disable the plugins button
   * @param aoPlugins 
   */
  initAreaPluginsButtons(aoPlugins: any[]){

    let asAvailableMapIds=[]

    const asMapIds = aoPlugins.map(oPlugin => oPlugin.id);
    const sMapIds = asMapIds.join(","); // e.g., "map1,map2,map3"

    if(sMapIds){
      
      this.m_oLayerService.findAvailableLayers(sMapIds,this.m_sAreaId,this.m_iSelectedDate, "").subscribe({

        next:(oResponse)=>{
          for (const oResponseEle of oResponse) {
            this.fillPluginsAndLayers(aoPlugins.find(oPlugin=>oPlugin.id===oResponseEle.mapId), oResponseEle);
            asAvailableMapIds.push(oResponseEle);
          }
          for (const oPlugin of aoPlugins) {
            oPlugin.disabled=!asAvailableMapIds.includes(oPlugin.id)
          }
        }
      })
    }
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
        console.log("imapcts works")
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