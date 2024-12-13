import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MapService} from '../../services/map.service';
import 'leaflet-draw';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import {AreaViewModel} from '../../models/AreaViewModel';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {TranslateService} from '@ngx-translate/core';
import 'leaflet.fullscreen';

// import * as L from 'leaflet';
declare const L: any;
const MIN_AREA_CIRCLE = 12_321_000_000; // Minimum 1x1 degree in square meters
const MAX_AREA_CIRCLE = 49_284_000_000; // Maximum 2x2 degree in square meters

const MIN_WIDTH = 111_000; // Minimum width 1 degree in meters
const MIN_HEIGHT = 111_000; // Minimum height 1 degree in meters
const MAX_WIDTH = 222_000; // Maximum width 2 degrees in meters
const MAX_HEIGHT = 222_000; // Maximum height 2 degrees in meters

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
  /**
   * Array of Areas of Operations (Dashboard)
   */
  @Input() m_aoAreas: Array<AreaViewModel> = [];

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
   * Is the map appearing on the user's monitor area?
   */
  @Input() m_bMonitorMap: boolean = false;

  @Output() m_oMapInputChange = new EventEmitter();

  m_oMap: L.Map;

  m_oMapOptions: any;

  m_oDrawnItems: any;

  m_oDrawOptions: any;
  // m_oActiveBaseLayer: any;
  // m_aoDrawnItems: L.FeatureGroup;
  m_bIsDrawCreated: boolean = false;
  m_bIsAutoDrawCreated: boolean = false;
  m_bIsImportDrawCreated: boolean = false;


  constructor(
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService,
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
        for (let oArea of this.m_aoAreas) {
          this.m_oMapService.addMarker(oArea, this.m_oMap);
        }
      }
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.m_bIsSelectingArea || changes['m_aoAreas']) {

      if (this.m_aoAreas.length > 0) {
        //clear the pins
        this.m_oMapService.clearMarkers();
        for (let oArea of this.m_aoAreas) {
          this.m_oMapService.addMarker(oArea, this.m_oMap);
        }
      } else {
        this.m_oMapService.clearMarkers();
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

    this.m_oMapService.addMousePositionAndScale(oMap);
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
    if (!this.m_bIsSelectingArea) {
      for (let oArea of this.m_aoAreas) {
        this.m_oMapService.addMarker(oArea, oMap);

      }
      this.addMeasurementTools(oMap);
    } else {
      this.addImportBtn(oMap);
      this.addManualBbox(oMap);
      this.addCircleButton(oMap);
    }

    oMap.fullscreenControl.link.innerHTML =
      "<span class='material-symbols-outlined'>fullscreen</span>";
    this.m_oMapService.addZoom();
    oMap.on('baselayerchange', (e) => {
      console.log('base layer changed');
      this.m_oMapService.setActiveLayer(oMap, e.layer);
    });

    if (this.m_bMonitorMap) {
      this.m_oMapService.addPixelInfoToggle(oMap);
      this.addMagicTool(oMap);
    }
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
    this.m_oMapService.addManualBbox(oMap);
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
      const bounds = layer.getBounds(); // Get the bounds of the rectangle
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      // Accurate distance calculation using Leaflet's distanceTo
      const width = L.latLng(southWest.lat, southWest.lng).distanceTo(
        L.latLng(southWest.lat, northEast.lng)
      );
      const height = L.latLng(southWest.lat, southWest.lng).distanceTo(
        L.latLng(northEast.lat, southWest.lng)
      );

      console.log('Calculated width:', width, 'Calculated height:', height);

      // Adjust if width or height are out of bounds
      if (
        width > MAX_WIDTH ||
        height > MAX_HEIGHT ||
        width < MIN_WIDTH ||
        height < MIN_HEIGHT
      ) {
        let sErrorMsg = '';
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          sErrorMsg = sErrorHeaderForTooBig;
        } else if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          sErrorMsg = sErrorHeaderForTooSmall;
        }
        this.m_oNotificationService
          .openConfirmationDialog(sErrorMsg, 'danger')
          .subscribe({
            next: (oResponse) => {
              if (oResponse) {
                // Adjust dimensions dynamically
                this.m_oMapService.adjustRectangleDimensions(
                  layer,
                  width,
                  height
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
      const latlngs = layer.getLatLngs()[0]; // Use the first array of latlngs
      const area = this.m_oMapService.calculatePolygonArea(latlngs); // Area in square meters
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const latitudeFactor = Math.cos(center.lat * (Math.PI / 180)); // Scale for latitude

      const adjustedMinArea = MIN_AREA_POLYGON * latitudeFactor;
      const adjustedMaxArea = MAX_AREA_POLYGON * latitudeFactor;

      if (area < adjustedMinArea || area > adjustedMaxArea) {
        let sErrorHeader = '';
        if (area < adjustedMinArea) {
          sErrorHeader = sErrorHeaderForTooSmall;
        } else if (area > adjustedMaxArea) {
          sErrorHeader = sErrorHeaderForTooBig;
        }
        this.m_oNotificationService.openInfoDialog(
          sErrorMsgAdjust,
          'danger',
          sErrorHeader
        );
      } else {
        this.handleValidArea(oEvent);
      }
    }
    if (layerType === 'circle') {
      const radius = layer.getRadius(); // Radius in meters
      const area = Math.PI * radius * radius; // Circle area
      if (area < MIN_AREA_CIRCLE || area > MAX_AREA_CIRCLE) {
        let sErrorMsg = '';
        if (area > MAX_AREA_CIRCLE) {
          sErrorMsg = sErrorMsgToBig;
        } else if (area < MIN_AREA_CIRCLE) {
          sErrorMsg = sErrorMsgToSmall;
        }
        this.m_oNotificationService
          .openConfirmationDialog(sErrorMsg, 'danger')
          .subscribe({
            next: (oResponse) => {
              if (oResponse) {
                this.m_oMapService.adjustCircleArea(layer, radius);
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
      next: (sMessage) => {
        this.m_oNotificationService.openSnackBar(sMessage, 'Measurement', 'success');
        // this.m_oNotificationService.openInfoDialog(sMessage, 'Measurement', 'success');
        window.dispatchEvent(new Event("resize"))
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
      const center = oEvent.layer.getLatLng();
      const radius = oEvent.layer.getRadius();
      iSelectedArea = Math.PI * Math.pow(radius, 2); // Calculate area of the circle

      oShapeInfo = {
        type: 'circle',
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        radius: radius,
        area: iSelectedArea,
      };
    }
    // Check if it's a polygon (including rectangles)
    else if (oEvent.layer instanceof L.Polygon) {
      const latLngs = oEvent.layer.getLatLngs()[0]; // Get the array of points (vertices)

      iSelectedArea = L.GeometryUtil.geodesicArea(latLngs); // Get the area of the polygon

      // Collect all points (vertices) of the polygon
      const points = latLngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });
      // Calculate the centroid (center) of the polygon
      const centroid = this.calculateCentroid(points);
      oShapeInfo = {
        type: 'polygon',
        points: points,
        area: iSelectedArea,
        center: centroid,
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

  private emitGeoJSONShapeInfo(geoJson: any) {
    let oShapeInfo = {};
    let iSelectedArea = 0;

    if (geoJson.geometry.type === 'Polygon') {
      // GeoJSON coordinates are in [lng, lat] format, need to convert to [lat, lng]
      const latLngs = geoJson.geometry.coordinates[0].map(
        (point: [number, number]) => {
          return L.latLng(point[1], point[0]); // Convert [lng, lat] to [lat, lng]
        }
      );

      // Calculate the area of the polygon using Leaflet GeometryUtil

      iSelectedArea = L.GeometryUtil.geodesicArea(latLngs);

      // Prepare the points data
      const points = latLngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });
      // Calculate the centroid (center) of the polygon
      const centroid = this.calculateCentroid(points);
      oShapeInfo = {
        type: 'polygon',
        points: points,
        area: iSelectedArea,
        center: centroid,
        geoJson: geoJson,
      };
    } else if (geoJson.type === 'circle') {
      //todo will have to test with file to verify
    }

    // Emit the shape information to the parent component
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
}
