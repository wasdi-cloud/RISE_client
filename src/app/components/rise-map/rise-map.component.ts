import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MapService} from '../../services/map.service';
import 'leaflet-draw';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import {AreaViewModel} from '../../models/AreaViewModel';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {TranslateService} from '@ngx-translate/core';
import 'leaflet.fullscreen';
import {EventViewModel} from "../../models/EventViewModel";

// import * as L from 'leaflet';
declare const L: any;
const MIN_AREA_CIRCLE = 12_321_000_000; // Minimum 1x1 degree in square meters
const MAX_AREA_CIRCLE = 49_284_000_000; // Maximum 2x2 degree in square meters

const MIN_WIDTH = 111_000; // Minimum width 1 degree in meters
const MIN_HEIGHT = 111_000; // Minimum height 1 degree in meters
const MAX_WIDTH = 666_000; // Maximum width 2 degrees in meters
const MAX_HEIGHT = 888_000; // Maximum height 2 degrees in meters

const MIN_AREA_POLYGON = 12_321_000_000; // Minimum 1x1 degree in square meters
const MAX_AREA_POLYGON = 49_284_000_000; // Maximum 2x2 degree in square meters

@Component({
  selector: 'rise-map',
  standalone: true,
  imports: [CommonModule, LeafletModule, LeafletDrawModule],
  templateUrl: './rise-map.component.html',
  styleUrl: './rise-map.component.css',
})
export class RiseMapComponent implements OnInit, AfterViewInit, OnChanges {

  //TODO unsubscribe from the observables

  /**
   * Array of Areas of Operations (Dashboard)
   */
  @Input() m_aoAreas: Array<AreaViewModel> = [];
  /**
   * Array of Events (Monitor)
   */
  @Input() m_aoEvents: Array<EventViewModel> = [];
  /**
   * Event (Monitor)
   */
  @Input() m_oEvent: EventViewModel = {}
  ;

  /**
   * Map Title
   */
  @Input() m_sMapTitle: string = '';

  /**
   * Is the map one where the user can select an area?
   */
  @Input() m_bIsSelectingArea: boolean = false;

  /**
   * Is the map appearing on the user dashboard area?
   */
  @Input() m_bDashboardMap: boolean = false;

  /**
   * Should we check max or min size?
   */
  @Input() m_bCheckAreaSize: boolean = true;

  /**
   * Is the map appearing on the user's monitor area?
   */
  @Input() m_bMonitorMap: boolean = false;

  @Output() m_oMapInputChange = new EventEmitter();

  @Output() m_bPrintButtonClick = new EventEmitter<boolean>(); // Or EventEmitter<any> if you want to pass data


  m_oMap: L.Map;

  m_oMapOptions: any;

  m_oDrawnItems: any;

  m_oDrawOptions: any;
  // m_oActiveBaseLayer: any;
  // m_aoDrawnItems: L.FeatureGroup;
  m_bIsDrawCreated: boolean = false;
  m_bIsAutoDrawCreated: boolean = false;
  m_bIsImportDrawCreated: boolean = false;

  private m_bIsManualBBoxInsert: boolean=false;




  constructor(
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService,
    private m_oViewContainerRef: ViewContainerRef,
  ) {
    this.m_oMapService.initTilelayer();
    this.m_oMapService.setMapOptions();
    this.m_oMapOptions = this.m_oMapService.m_oOptions;

    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }

  ngOnInit(): void {
    if (!this.m_bIsSelectingArea) {
      if (this.m_aoAreas.length > 0) {
        this.m_oMapService.clearMarkers();
        for (let oArea of this.m_aoAreas) {
          this.m_oMapService.addAreaMarker(oArea, this.m_oMap);
        }
      }
      if (this.m_aoEvents.length > 0) {
        this.m_oMapService.clearEventMarkers();
        for (let oEvent of this.m_aoEvents) {
          this.m_oMapService.addEventMarker(oEvent, this.m_oMap);
        }
      }
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.m_bIsSelectingArea) {
      if(changes['m_aoAreas']){
        if (this.m_aoAreas.length > 0) {
          //clear the pins
          this.m_oMapService.clearMarkers();
          for (let oArea of this.m_aoAreas) {
            this.m_oMapService.addAreaMarker(oArea, this.m_oMap);
          }

        } else {
          this.m_oMapService.clearMarkers();
        }
      }
      if(changes['m_aoEvents']){
        this.m_oMapService.clearMarkers();
        if (this.m_aoEvents.length > 0) {
          for (let oEvent of this.m_aoEvents) {
            this.m_oMapService.addEventMarker(oEvent, this.m_oMap);
          }
        }
      }
      if(changes['m_oEvent']){
        if (!this.m_oMap) {
          console.warn("Map is not initialized yet. Retrying...");
          setTimeout(() => {
            if (this.m_oMap) {
              this.m_oMapService.clearEventMarkers();
              this.m_oMapService.addEventMarker(this.m_oEvent, this.m_oMap);
            } else {
              console.error("Map is still null after waiting.");
            }
          }, 100); // Delay to wait for initialization
          return;
        }

      }
    }
  }

  onMapReady(oMap) {
    this.m_oMap = oMap;
    this.m_oMapService.setMap(this.m_oMap);
    if (this.m_bIsSelectingArea) {
      this.m_oMapService.clearPreviousDrawings(oMap);
    }
    this.m_oMapService.setActiveLayer(
      oMap,
      this.m_oMapService.m_oDarkGrayArcGIS
    );
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);
    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    this.m_oMapService.addMousePositionAndScale(oMap,this.m_bDashboardMap);
    this.m_oMapService.addZoom();
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
    if (!this.m_bIsSelectingArea) {
      for (let oArea of this.m_aoAreas) {
        this.m_oMapService.addAreaMarker(oArea, oMap);

      }
      this.addMeasurementTools(oMap);
    } else {
      this.addImportBtn(oMap);
      this.addManualBbox(oMap);
      this.addCircleButton(oMap);
    }

    oMap.fullscreenControl.link.innerHTML =
      "<span class='material-symbols-outlined'>fullscreen</span>";

    oMap.on('baselayerchange', (e) => {
      this.m_oMapService.setActiveLayer(oMap, e.layer);
    });

    if (this.m_bMonitorMap) {
      this.m_oMapService.addPixelInfoToggle(oMap);
      this.addPrinterButton(oMap);
      this.addMagicTool(oMap);
    }
    this.m_oMapService.setupInstantDelete(oMap);
    oMap.on(L.Draw.Event.DELETED, (oEvent) => {
      console.log("pressed")
      this.onDrawDeleted(oEvent);
    });

  }

  addCircleButton(oMap: L.Map): void {
    this.m_oMapService.addCircleButton(oMap).subscribe((circleData) => {
      this.m_bIsAutoDrawCreated = true;
      const {center, radius} = circleData;

      this.emitInsertedArea(null, radius, center.lat, center.lng);
    });
  }

  //Go to position by inserting coords
  addManualBbox(oMap: any) {
    this.m_oMapService.addManualBbox(oMap).subscribe((bboxData)=>{
      if(bboxData){
        this.m_bIsManualBBoxInsert=true;
        const { geoJson,center}=bboxData;
        this.emitInsertedArea(null,null,center.lat,center.lng,geoJson)
      }
    });
  }

  addImportBtn(oMap: any) {
    this.m_oMapService.addImportButton(oMap);
  }

  // Different ways to draw an area
  //Using leaflet drawings
  onDrawCreated(oEvent) {
    const {layerType, layer} = oEvent;
    const sErrorMsgToBig: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_AREA_TOO_BIG'
    );
    const sErrorMsgToSmall: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_AREA_TOO_SMALL'
    );
    const sErrorMsgAdjust: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_CREATE_NEW_AREA'
    );
    const sErrorHeaderForTooBig: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.AREA_HEADER_TOO_BIG'
    );
    const sErrorHeaderForTooSmall: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.AREA_HEADER_TOO_SMALL'
    );
    if (layerType === 'rectangle') {
      const asBounds = layer.getBounds(); // Get the asBounds of the rectangle
      const oSouthWest = asBounds.getSouthWest();
      const oNorthEast = asBounds.getNorthEast();

      // Accurate distance calculation using Leaflet's distanceTo
      const dWidth = L.latLng(oSouthWest.lat, oSouthWest.lng).distanceTo(
        L.latLng(oSouthWest.lat, oNorthEast.lng)
      );
      const dHeight = L.latLng(oSouthWest.lat, oSouthWest.lng).distanceTo(
        L.latLng(oNorthEast.lat, oSouthWest.lng)
      );



      // Adjust if dWidth or dHeight are out of asBounds
      if (
        (dWidth > MAX_WIDTH ||
        dHeight > MAX_HEIGHT ||
        dWidth < MIN_WIDTH ||
        dHeight < MIN_HEIGHT) && this.m_bCheckAreaSize
      ) {
        let sErrorMsg = '';
        if (dWidth > MAX_WIDTH || dHeight > MAX_HEIGHT) {
          sErrorMsg = sErrorHeaderForTooBig;
        } else if (dWidth < MIN_WIDTH || dHeight < MIN_HEIGHT) {
          sErrorMsg = sErrorHeaderForTooSmall;
        }
        this.m_oNotificationService
          .openConfirmationDialog(sErrorMsg, 'danger',this.m_oViewContainerRef)
          .subscribe({
            next: (oResponse) => {
              if (oResponse) {
                // Adjust dimensions dynamically
                this.m_oMapService.adjustRectangleDimensions(
                  layer,
                  dWidth,
                  dHeight
                );
                this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
                this.m_bIsDrawCreated = true;
                this.emitInsertedArea(oEvent);
              } else {
                return;
              }
            },
          });
      } else {
        this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
        this.m_bIsDrawCreated = true;
        this.emitInsertedArea(oEvent);
      }
    }

    if (layerType === 'polygon') {
      const asLatlngs = layer.getLatLngs()[0]; // Use the first array of asLatlngs
      const dArea = this.m_oMapService.calculatePolygonArea(asLatlngs); // Area in square meters
      const asBounds = layer.getBounds();
      const oCenter = asBounds.getCenter();
      const dLatitudeFactor = Math.cos(oCenter.lat * (Math.PI / 180)); // Scale for latitude
      //todo here we need to think about it more , because right now we are using the dArea value but its not actually true always , for more precision
      // we need to take into consideration the dLatitudeFactor
      const dAdjustedArea = dArea * dLatitudeFactor;

      if ( (dArea < MIN_AREA_POLYGON || dArea > MAX_AREA_POLYGON) && this.m_bCheckAreaSize) {
        let sErrorHeader = '';

        if (dArea < MIN_AREA_POLYGON) {
          sErrorHeader = sErrorHeaderForTooSmall;
        }
        else if (dArea > MAX_AREA_POLYGON) {
          sErrorHeader = sErrorHeaderForTooBig;
        }
        this.m_oNotificationService.openInfoDialog(
          sErrorHeader,
          'danger',
          sErrorHeader,
          this.m_oViewContainerRef
        );
      } else {
        this.handleValidArea(oEvent);
      }
    }
    if (layerType === 'circle') {
      const dRadius = layer.getRadius(); // Radius in meters
      const dArea = Math.PI * dRadius * dRadius; // Circle dArea
      if ( (dArea < MIN_AREA_CIRCLE || dArea > MAX_AREA_CIRCLE) && this.m_bCheckAreaSize) {
        let sErrorMsg = '';
        if (dArea > MAX_AREA_CIRCLE) {
          sErrorMsg = sErrorMsgToBig;
        } else if (dArea < MIN_AREA_CIRCLE) {
          sErrorMsg = sErrorMsgToSmall;
        }
        this.m_oNotificationService
          .openConfirmationDialog(sErrorMsg, 'danger',this.m_oViewContainerRef)
          .subscribe({
            next: (oResponse) => {
              if (oResponse) {
                this.m_oMapService.adjustCircleArea(layer, dRadius);
                this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
                this.m_bIsDrawCreated = true;
                this.emitInsertedArea(oEvent);
              }
            },
          });
      } else {
        this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
        this.m_bIsDrawCreated = true;
        this.emitInsertedArea(oEvent);
      }
    }
  }

  //Emit inserted area
  emitInsertedArea(
    oEvent?: any,
    fRadius?: number,
    fLat?: number,
    fLng?: number,
    geoJson?: any
  ) {
    if (this.m_bIsImportDrawCreated && geoJson) {
      this.m_bIsImportDrawCreated = false;
      this.emitGeoJSONShapeInfo(geoJson);
    } else if (this.m_bIsDrawCreated && oEvent) {
      this.m_bIsDrawCreated = false;
      this.emitDrawnAreaEvent(oEvent);
    } else if (
      this.m_bIsAutoDrawCreated &&
      fRadius !== undefined &&
      fLat !== undefined &&
      fLng !== undefined
    ) {
      this.m_bIsAutoDrawCreated = false;
      this.emitCircleButtonAreaEvent(fRadius, fLat, fLng);
    }
    else if (
      this.m_bIsManualBBoxInsert &&
      geoJson !== undefined &&
      fLat !== undefined &&
      fLng !== undefined
    ) {
      this.m_bIsManualBBoxInsert = false;
      this.emitManualBboxEvent(geoJson, fLat, fLng);
    }
  }

  // Function to calculate the centroid of a polygon
  calculateCentroid(points: Array<{ lat: number; lng: number }>): {
    lat: number;
    lng: number;
  } {
    let latSum = 0;
    let lngSum = 0;
    const numPoints = points.length;

    points.forEach((point) => {
      latSum += point.lat;
      lngSum += point.lng;
    });

    // Return the average lat and lng to get the centroid
    return {
      lat: latSum / numPoints,
      lng: lngSum / numPoints,
    };
  }

  addMeasurementTools(oMap) {
    this.m_oMapService.addMeasurementTools(oMap).subscribe({
      next: (oResponse) => {
        if(oResponse){
          if(oResponse.message && oResponse.wkt){
            let sMessage=oResponse.message
            this.m_oNotificationService.openSnackBar(sMessage, 'Measurement', 'success',true,this.m_oViewContainerRef);
            window.dispatchEvent(new Event("resize"))
          }else if(oResponse.message ){
            let sMessage=oResponse.message
            this.m_oNotificationService.openSnackBar(sMessage, 'Measurement', 'success',true,this.m_oViewContainerRef);
            window.dispatchEvent(new Event("resize"))
          }
          this.m_oMapInputChange.emit(oResponse.wkt);

        }
        // this.m_oNotificationService.openInfoDialog(sMessage, 'Measurement', 'success');
      },
      error: (err) => {
        console.error('Error in Measurement:', err);
      },
    });

  }

  private handleValidArea(oEvent) {
    this.m_oMapService.onDrawCreated(oEvent, this.m_oMap);
    this.m_bIsDrawCreated = true;
    this.emitInsertedArea(oEvent);
  }

  //Emitting the area to the parent component
  private emitDrawnAreaEvent(oEvent) {
    let iSelectedArea = 0;
    let oShapeInfo = {};

    // Check if it's a circle
    if (oEvent.layer instanceof L.Circle) {
      const oCenter = oEvent.layer.getLatLng();
      const dRadius = oEvent.layer.getRadius();
      iSelectedArea = Math.PI * Math.pow(dRadius, 2); // Calculate area of the circle

      oShapeInfo = {
        type: 'circle',
        center: {
          lat: oCenter.lat,
          lng: oCenter.lng,
        },
        radius: dRadius,
        area: iSelectedArea,
      };
    }
    // Check if it's a polygon (including rectangles)
    else if (oEvent.layer instanceof L.Polygon) {
      const asLatLngs = oEvent.layer.getLatLngs()[0]; // Get the array of asPoints (vertices)

      iSelectedArea = L.GeometryUtil.geodesicArea(asLatLngs); // Get the area of the polygon

      // Collect all asPoints (vertices) of the polygon
      const asPoints = asLatLngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });
      // Calculate the dCentroid (center) of the polygon
      const dCentroid = this.calculateCentroid(asPoints);
      oShapeInfo = {
        type: 'polygon',
        points: asPoints,
        area: iSelectedArea,
        center: dCentroid,
        geoJson: oEvent.layer.toGeoJSON().geometry,
      };
    }
    // Emit the shape information (area, points, center, radius) to the parent component
    this.m_oMapInputChange.emit(oShapeInfo);
  }

  private emitCircleButtonAreaEvent(fRadius: number, fLat, fLng) {
    const fArea = Math.PI * fRadius * fRadius;

    // Emit the circle info (center, radius, and area)
    const oShapeInfo = {
      type: 'circle',
      center: {lat: fLat, lng: fLng},
      radius: fRadius,
      area: fArea, // Add area to the emitted shape info
    };
    this.m_oMapInputChange.emit(oShapeInfo);
  }

  private emitGeoJSONShapeInfo(oGeoJson: any) {
    let oShapeInfo: any = {};

    // 1. Convert GeoJSON to a Leaflet Layer to use Leaflet's powerful utility methods
    const oTempLayer = L.geoJSON(oGeoJson);
    const aoLayers = oTempLayer.getLayers();

    if (aoLayers.length === 0) return;

    // We take the first layer (assuming the import is one primary area)
    const oLayer: any = aoLayers[0];

    // 2. Handle Polygons (this includes Rectangles and 'Circle-like' polygons from Shapefiles)
    if (oLayer instanceof L.Polygon) {
      // getLatLngs() for Polygons can be nested (for holes), flat(Infinity) ensures we get all points
      const asLatLngs = oLayer.getLatLngs() as any;
      const asFlatLatLngs = asLatLngs.flat(Infinity);

      // Calculate Area & Center using Leaflet's tools
      const iArea = L.GeometryUtil.geodesicArea(asFlatLatLngs);
      const oBounds = oLayer.getBounds();
      const oCenter = oBounds.getCenter();

      const adPoints = asFlatLatLngs.map((oCoord: L.LatLng) => ({
        lat: oCoord.lat,
        lng: oCoord.lng
      }));

      oShapeInfo = {
        type: 'polygon',
        points: adPoints,
        area: iArea,
        center: { lat: oCenter.lat, lng: oCenter.lng },
        geoJson: oGeoJson
      };
    }

      // 3. Special Case: Actual GeoJSON Circles
    // (Rare in standard Shapefiles, but possible in some GeoJSON extensions)
    else if (oLayer instanceof L.Circle) {
      const oCenter = oLayer.getLatLng();
      const fRadius = oLayer.getRadius();
      oShapeInfo = {
        type: 'circle',
        center: { lat: oCenter.lat, lng: oCenter.lng },
        radius: fRadius,
        area: Math.PI * Math.pow(fRadius, 2),
        geoJson: oGeoJson
      };
    }

    this.m_oMapInputChange.emit(oShapeInfo);
  }

  private addMagicTool(oMap) {
    this.m_oMapService.addMagicTool(oMap).subscribe({
      next: (sMessage) => {
        if (sMessage === 'No layers selected.') {
          this.m_oNotificationService.openSnackBar(sMessage, 'Magic Tool', 'danger');

        } else if (sMessage === 'Shape does not intersect with any selected layer.') {
          this.m_oNotificationService.openSnackBar(sMessage, 'Magic Tool', 'danger');

        }
        window.dispatchEvent(new Event("resize"))
      },
      error: (err) => {
        console.error('Error in Magic Tool:', err);
      },
    });


  }

  private emitManualBboxEvent(geoJson: any, fLat: number, fLng: number) {
    if (!geoJson || geoJson.type !== 'Polygon' || !geoJson.coordinates) {
      console.error('Invalid GeoJSON format:', geoJson);
      return;
    }

    let iSelectedArea = 0;
    let latLngs: L.LatLng[] = [];

    try {
      // Convert [lng, lat] to [lat, lng] for Leaflet compatibility
      latLngs = geoJson.coordinates[0].map(
        (point: [number, number]) => L.latLng(point[1], point[0])
      );

      // Calculate the area of the polygon
      iSelectedArea = L.GeometryUtil.geodesicArea(latLngs);
    } catch (error) {
      console.error('Error processing GeoJSON coordinates:', error);
      return;
    }

    // Convert to array of lat/lng objects
    const points = latLngs.map((point: L.LatLng) => ({ lat: point.lat, lng: point.lng }));

    // Use provided center coordinates instead of recalculating centroid
    const oShapeInfo = {
      type: 'polygon',
      points,
      area: iSelectedArea,
      center: { lat: fLat, lng: fLng }, // Using provided center
      geoJson, // Keep original GeoJSON
    };

    // Emit the structured shape information
    this.m_oMapInputChange.emit(oShapeInfo);
  }


  private addPrinterButton(oMap) {
    this.m_oMapService.addPrinterButton(oMap).subscribe({
      next: (sMessage) => {
        this.m_bPrintButtonClick.emit(true);
      }
    });
  }

  onDrawDeleted(oEvent) {
    // When a shape is deleted, clear the marker and emit a null/empty area to the parent.
    this.m_oMapService.clearPreviousDrawings(this.m_oMap);
    this.m_oMapInputChange.emit(null);
    console.log('Shape deleted. Area selection cleared.');
  }
}
