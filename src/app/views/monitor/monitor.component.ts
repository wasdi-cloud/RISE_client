import {Component, OnInit} from '@angular/core';
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
import {PluginViewModel} from "../../models/PluginViewModel";
import {EventService} from "../../services/api/event.service";

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
export class MonitorComponent implements OnInit {
  /**
   * UC_120 Monitor Area of Operations
   */
  /**
   * Flag to show either 2D Leaflet map or 3D Cesium Map (TODO: CESIUM)
   */
  m_bShow2D: boolean = true;

  /**
   * Flag to track if the layer legend should be shown
   */
  m_bShowLegends: boolean = false;

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
   * Legend URLs
   */
  m_aoLegendUrls: Array<{ url: string; plugin: string; visible: boolean }> = [];

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
  }

  ngOnInit(): void {
    this.m_iCurrentDate=this.getCurrentDate();
    this.getActiveAOI();
    this.m_oMapService.m_oLayerAnalyzerDialogEventEmitter.subscribe((shouldOpenDialog: boolean) => {
      if (shouldOpenDialog) {
        this.openLayerAnalyzerDialog(); // Your dialog opening method
      }
    });
    this.getEvents()
  }

  //   RISE shows the Monitor Section containing:
  // A browsable map (including a geocoding search tool)
  // A timeline to change the reference time of the viewer
  // Options to show/hide the available layers:
  // Near Real Time flood Maps
  // Near Real Time drought indicator
  // Near Real Time Buildings Map
  // Near Real Time Impacts Map
  // Updated Flood Frequency Map
  // Meteo Models
  // Ground Stations Data
  // Add new Geolocalized Events (and show the layer on the map)
  // Activate the cross-section tool

  /**
   * Get area of operations from the constants service if it was active or the URL if on refresh then open
   * UC: RISE shows the Monitor Section containing a browsable map (including a geocoding search tool)
   * @returns void
   */
  getActiveAOI(): void {
    if (this.m_oConstantsService.getActiveAOI()) {
      this.m_oAreaOfOperation = this.m_oConstantsService.getActiveAOI();
    } else if (this.m_oActivatedRoute.snapshot.params['aoiId']) {
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
  getCurrentDate(){
      const oToday = new Date(); // Get the current date and time
      const oStaticDate = new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());
      return Math.floor(oStaticDate.getTime() / 1000); // Return as UNIX timestamp (seconds)
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
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.getMapsByArea(oResponse.id, oResponse.startDate);
          this.m_oMapService.flyToMonitorBounds(oResponse.bbox);
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

  private fillPluginsAndLayers(oPlugin: any, aoLayer:LayerViewModel) {
    if (!this.m_aoLayers.some(layer => layer.layerId === aoLayer.layerId)) {
      this.m_aoLayers.push(aoLayer);
    }
    // Check if oPlugin.layers already contains the object
    if (!oPlugin.layers.some(layer => layer.layerId === aoLayer.layerId)) {
      oPlugin.layers.push(aoLayer);
    }
    this.m_aoReversedLayers = [...this.m_aoLayers].reverse();


    this.m_oMapService.addLayerMap2DByServer(
      aoLayer.layerId,
      aoLayer.geoserverUrl
    );
    // Update the selected layers
    this.m_oMapService.setSelectedLayers(this.m_aoLayers)
  }

  /**
   * Handle Changes to the Reference Time from the Timebar Component
   *  UC: RISE shows the Monitor Section containing a timeline to change the reference time of the viewer
   */
  getReferenceTime(oEvent): void {
    this.m_oSelectedDate = oEvent;
    this.m_aoPlugins.forEach((oPlugin) => {
      if (oPlugin.loaded) {
        this.getLayer(oPlugin, this.m_sAreaId, this.m_oSelectedDate);
      }
    });
  }

  /**
   * TODO: open dialog to add event
   * UC: Add new Geolocalized Events (and show the layer on the map)
   */
  addNewGeolocalizedEvent() {
  }

  /**
   * TODO: Open Cross-section tool
   */
  openCrossSectionTool() {
  }

  switchPluginButton(oPlugin:any) {
    //was active,turn it to inactive
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
      case 'toggleLegend':
        this.showLegend(oEvent.layer);
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
    let iLegendIndex = this.m_aoLegendUrls.findIndex(
      (oLayer) => oLayer.plugin === oEvent.mapId
    );

    this.m_aoLegendUrls.splice(iLegendIndex, 1);

    if (this.m_aoLegendUrls.length === 0) {
      this.toggleLegend(false);
    }
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

  showLegend(oLayer) {
    let sLayerUrl = this.m_oMapService.getLegendUrl(oLayer);
    // If there are no legends - add right away
    if (this.m_aoLegendUrls.length === 0) {
      this.m_aoLegendUrls.push({
        url: sLayerUrl,
        plugin: oLayer.mapId,
        visible: true,
      });
    }

    //Is the legend already in the array?
    let iIndex = this.m_aoLegendUrls.findIndex(
      (layer) => layer.url === sLayerUrl
    );
    if (iIndex === -1) {
      this.m_aoLegendUrls.push({
        url: sLayerUrl,
        plugin: oLayer.mapId,
        visible: true,
      });
    }
    this.toggleLegend(true);
  }

  toggleLegend(bShowLegend: boolean) {
    this.m_bShowLegends = bShowLegend;
  }

  toggleIconVis(oLegend) {
    oLegend.visible = !oLegend.visible;
  }

  handleLiveButtonPressed() {
    //todo show closet layer to the live button
    //sort the layer based on difference between date and closest date
    if(this.m_aoLayers && this.m_aoLayers.length>0){
      let oTargetDate = new Date(this.m_sEndDate).getTime();
      const aoSortedLayers = this.m_aoLayers.sort((a, b) =>
        Math.abs(a.referenceDate - oTargetDate) -
        Math.abs(b.referenceDate - oTargetDate)
      );
      this.setOpacity(100, aoSortedLayers[0].layerId)
      for (let i = 1; i < this.m_aoLayers.length; i++) {
        this.setOpacity(0, aoSortedLayers[i].layerId)
      }
    }
  }
  async handlePlayButtonPressed(sSelectedDate) {
    //todo show  layer gradually from selected date to newest date
    if (this.m_aoLayers && this.m_aoLayers.length > 0) {
      const aoSortedLayers = this.m_aoLayers.sort((a, b) => a.referenceDate - b.referenceDate);
      for (const aoSortedLayer of aoSortedLayers) {
        // Show the current aoSortedLayer
        this.setOpacity(1, aoSortedLayer.layerId);
        // Wait for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Hide the current aoSortedLayer
        this.setOpacity(0,aoSortedLayer.layerId);
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
        next:(oEventVM)=>{

        },
        error:(oError)=>{
          console.error(oError)
        }
      })
    }

  }
}
