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

import {LayerTypes} from './layer-types';
import {FilterPipe} from '../../shared/pipes/filter.pipe';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {MatDialog} from "@angular/material/dialog";
import {LayerPropertiesComponent} from "./layer-properties/layer-properties.component";
import {LayerAnalyzerComponent} from "./layer-analyzer/layer-analyzer.component";
import {LayerViewModel} from "../../models/LayerViewModel";
import {EventService} from "../../services/api/event.service";
import {EventViewModel} from "../../models/EventViewModel";

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
   * UC_120 Monitor Area of Operations
   */
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
  m_oSelectedDate: any = '';



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
   * Current date
   */
  m_iCurrentDate: number = null;

  /**
   * List of Events
   */
  m_aoEvents:EventViewModel[]=[]
  m_iInitialPeakDate: number;
  m_iVisibleCount = 5;
  m_bShowAllPlugins = false;

  private m_oLiveTimer: any;


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
  ) {
    const navigation = this.m_oRouter.getCurrentNavigation();
    const state = navigation?.extras?.state as { peakDate?: string };

    if (state?.peakDate) {

      this.m_oSelectedDate= (Number(state?.peakDate) * 1000).toString();
      this.m_iInitialPeakDate = new Date(state.peakDate).getTime();

    }
  }

  ngOnInit(): void {

    this.m_iCurrentDate=this.getCurrentDate();
    this.startLiveTimer();

    this.getActiveAOI();
    this.m_oMapService.m_oLayerAnalyzerDialogEventEmitter.subscribe((shouldOpenDialog: boolean) => {
      if (shouldOpenDialog) {
        this.openLayerAnalyzerDialog(); // Your dialog opening method
      }
    });
    this.getEvents()
  }

  ngAfterViewInit(): void {
    document.addEventListener('fullscreenchange', () => {

      const fullscreenElement = document.fullscreenElement;
      const btnContainer = this.btnContainerRef.nativeElement;
      const originalParent = this.tempFixRef.nativeElement;

      const fullscreenClass = 'fullscreen-btn-container'; // This will be the class for fullscreen mode
      const normalClass = 'btn-select-container'; // This will be the class for fullscreen mode

      // Add or remove the fullscreen class based on the fullscreen state
      if (fullscreenElement && !fullscreenElement.contains(btnContainer)) {
        fullscreenElement.appendChild(btnContainer);
        btnContainer.classList.add(fullscreenClass);
        btnContainer.classList.remove(normalClass);
      } else if (!fullscreenElement) {
        originalParent.insertBefore(btnContainer, originalParent.firstChild);
        btnContainer.classList.remove(fullscreenClass);
        btnContainer.classList.add(normalClass);


      }
    });
  }

  ngOnDestroy(): void {
    this.stopLiveTimer();
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
  getCurrentDate(): number {
    return Math.floor(Date.now() / 1000); // Current timestamp in seconds
  }

  /**
   * Retrieve area of operations info from the server
   * UC: RISE shows the Monitor Section containing a browsable map (including a geocoding search tool)
   * @param sAreaId
   */
  openAOI(sAreaId: string): void {
    this.m_oAreaService.getAreaById(sAreaId).subscribe({
      next: (oResponse) => {
        this.m_oAreaOfOperation = oResponse;
        this.m_oConstantsService.setActiveArea(this.m_oAreaOfOperation);
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.getMapsByArea(oResponse.id, oResponse.startDate);
          this.m_oMapService.flyToMonitorBounds(oResponse.bbox);
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
          this.m_aoPlugins.forEach((oPlugin) => {
            if (this.m_aoPlugins[0].name === oPlugin.name) {
              this.m_oActivePlugin = this.m_aoPlugins[0];
            }
          });
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

    this.m_oLayerService
      .findLayer(oPlugin.id, sAreaId, this.m_oSelectedDate)
      .subscribe({
        next: (oLayerVM:LayerViewModel) => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayerVM)) {

            this.fillPluginsAndLayers(oPlugin, oLayerVM);
          }else{
            let sError: string = this.m_oTranslate.instant(
              'ERROR_MSG.ERROR_LAYER_FAILURE'
            );
            let sErrorMessage=sError.concat(oPlugin.name?oPlugin.name:"this plugin");
            this.m_oNotificationService.openInfoDialog(sErrorMessage, 'error', 'Error');
            oPlugin.loaded = false;
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
    const index = this.m_aoLayers.findIndex(layer => layer.mapId === oLayer.mapId);
    if (index !== -1) {
      oMap.eachLayer((oMapLayer) => {
        let sOldLayerId = this.m_aoLayers[index].layerId;
        if (sOldLayerId === oMapLayer.options.layers) {
          oMap.removeLayer(oMapLayer);
        }
      });
      this.m_aoLayers[index] = oLayer;  // Replace existing
    } else {
      this.m_aoLayers.push(oLayer);     // Add new if not found
    }

    // Check if oPlugin.layers already contains the object
    if (!oPlugin.layers.some(layer => layer.layerId === oLayer.layerId)) {
      oPlugin.layers.push(oLayer);
    }

    //sort the layers
    this.m_aoLayers = this.m_aoLayers.sort((a, b) => a.referenceDate - b.referenceDate);
    //filter the layer based on the selected date
    //todo verify this , because i think its implemented already in backend
    // if(this.m_oSelectedDate){
    //   this.m_aoLayers = this.m_aoLayers.filter(layer => layer.referenceDate *1000<= this.m_oSelectedDate);
    // }

    //
    this.m_aoReversedLayers = [...this.m_aoLayers].reverse();


    this.m_oMapService.addLayerMap2DByServer(
      oLayer.layerId,
      oLayer.geoserverUrl
    );
    // Update the selected layers
    this.m_oMapService.setSelectedLayers(this.m_aoLayers)
  }

  /**
   * Handle Changes to the Reference Time from the Timebar Component
   *  UC: RISE shows the Monitor Section containing a timeline to change the reference time of the viewer
   */
  getReferenceTime(oEvent:any): void {
    this.m_oSelectedDate = oEvent;

    this.initPluginsButtons(this.m_aoPlugins);
    this.m_aoPlugins.forEach((oPlugin) => {
      if (oPlugin.loaded) {
        this.getLayer(oPlugin, this.m_sAreaId, this.m_oSelectedDate);
      }
    });
  }
  switchPluginButton(oPlugin:any) {
    //was active,turn it to inactive
    if(oPlugin.disabled){
      return;
    }
    if(oPlugin.loaded){
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

    }else{
      //was inactive,turn it to active
      this.m_oActivePlugin = oPlugin;
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
    let aoOrderedLayers=this.m_aoReversedLayers.reverse();
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
        oLayer.geoserverUrl
      );
    });
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

  handleLiveButtonPressed(bIsLive) {
    this.m_bIsLive = bIsLive;
    if(this.m_bIsLive){
      this.startLiveTimer();
      // Update current date and end date immediately
      this.m_iCurrentDate = this.getCurrentDate();
      this.m_sEndDate = new Date(this.m_iCurrentDate * 1000).toISOString(); // Store as ISO string if expected

      // Show closest layer to live date
      if (this.m_aoLayers && this.m_aoLayers.length > 0) {
        const oTargetDate = this.m_iCurrentDate * 1000; // milliseconds
        const aoSortedLayers = this.m_aoLayers.sort((a, b) =>
          Math.abs(a.referenceDate - oTargetDate) -
          Math.abs(b.referenceDate - oTargetDate)
        );
        this.setOpacity(100, aoSortedLayers[0].layerId);
        for (let i = 1; i < this.m_aoLayers.length; i++) {
          this.setOpacity(0, aoSortedLayers[i].layerId);
        }
      }
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
    this.m_oDialog.open(LayerAnalyzerComponent).afterClosed().subscribe(() => {
      console.log("layer analyzer is working")
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

  private addEventsToTimebar() {

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
      this.m_oLayerService.findLayer(oPlugin.id,this.m_sAreaId,this.m_oSelectedDate).subscribe({
        next:(oResponse)=>{
          oPlugin.disabled = FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse);
        }
      })

    }
  }
}
