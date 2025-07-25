import {EventEmitter, Injectable} from '@angular/core';

import {AreaViewModel} from '../models/AreaViewModel';

import {MatDialog} from '@angular/material/dialog';

import Geocoder from 'leaflet-control-geocoder';
import {geoJSON, Map as LeafletMap, Marker} from 'leaflet';
import 'leaflet-draw';
import 'leaflet-mouse-position';
import {BehaviorSubject, buffer, Observable, Subject} from 'rxjs';
import {wktToGeoJSON} from '@terraformer/wkt';
import {ManualBoundingBoxComponent} from '../dialogs/manual-bounding-box-dialog/manual-bounding-box.component';
import {
  ImportShapeFileStationDialogComponent
} from '../dialogs/import-shape-file-station-dialog/import-shape-file-station-dialog.component';
import FadeoutUtils from '../shared/utilities/FadeoutUtils';
import {NotificationsDialogsService} from './notifications-dialogs.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConstantsService} from './constants.service';
import {TranslateService} from '@ngx-translate/core';
import {EventViewModel} from "../models/EventViewModel";
import {MapZoomLevels} from "../shared/MapZoomLevels";
import { now } from 'moment';
import { firstValueFrom } from 'rxjs';
// import L from 'leaflet';
declare const L: any;

const sIconRetinaUrl = 'assets/rise-assets/icon-location-hazard-filled.png';
const sIconUrl = 'assets/rise-assets/icon-location-hazard-filled.png';
const sIconUrlPublic = 'assets/rise-assets/icon-location-hazard-filled-public.png';
const sIconUrlShared = 'assets/rise-assets/icon-location-hazard-filled-shared.png';
const sGeoCoderIconUrl = 'assets/rise-assets/flag_optimized.png';
const sGeoCoderRetinaIconUrl = 'assets/rise-assets/flag_optimized.png';
const sShadowUrl = '/assets/marker-shadow.png';

const oGeoCoderIcon = L.icon({
  iconUrl:sGeoCoderIconUrl,
  iconRetinaUrl:sGeoCoderRetinaIconUrl,
  shadowUrl:sShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const oIconDefault = L.icon({
  iconRetinaUrl: sIconRetinaUrl,
  iconUrl: sIconUrl,
  shadowUrl: sShadowUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [32, 32],
});

const oIconShared = L.icon({
  iconRetinaUrl: sIconUrlShared,
  iconUrl: sIconUrlShared,
  shadowUrl: sShadowUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [32, 32],
});

const oIconPublic = L.icon({
  iconRetinaUrl: sIconUrlPublic,
  iconUrl: sIconUrlPublic,
  shadowUrl: sShadowUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [32, 32],
});


const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB for testing
const MIN_AREA_CIRCLE = 12_321_000_000; // Minimum 1x1 degree in square meters
const MAX_AREA_CIRCLE = 49_284_000_000; // Maximum 2x2 degree in square meters

const MIN_WIDTH = 111_000; // Minimum width 1 degree in meters
const MIN_HEIGHT = 111_000; // Minimum height 1 degree in meters
const MAX_WIDTH = 222_000; // Maximum width 2 degrees in meters
const MAX_HEIGHT = 222_000; // Maximum height 2 degrees in meters



@Injectable({
  providedIn: 'root',
})
export class MapService {
  /**
   * OSM Basic Map
   */
  m_oOSMBasic: any = null;
  /**
   * Topography Map
   */
  m_oOpenTopoMap: any = null;
  /**
   * Esri World Street Maps
   */
  m_oEsriWorldStreetMap: any = null;
  /**
   * Esri Imaging
   */
  m_oEsriWorldImagery: any = null;
  /**
   * Dark Stadia Map
   */
  m_oStadiMapDark: any = null;
  /**
   * Dark Gray Arcgis Map
   */
  m_oDarkGrayArcGIS: any = null;

  /**
   * Is the component toggle-able to 3D map?
   */
  m_bIsToggle: boolean = false;

  /**
   * declare object for Layers Control options
   */
  m_oLayersControl: any;

  /**
   * Object containing the drawn items done on the map
   */
  m_oDrawnItems: L.FeatureGroup = new L.FeatureGroup();

  /**
   * Reference to the actual leaflet map itself
   */
  m_oRiseMap: any;

  m_oActiveBaseLayer: any;
  /**
   * Default Leaflet options
   */
  m_oOptions: any;

  m_oGeocoderControl: Geocoder = new Geocoder();

  m_oGeocoderMarker: L.Marker = null;

  /**
   * Area of Interest for Magic Tool
   */
  m_oMagicToolAOI: any = null;
  /*
  *this is a custom icon to change the polygon edges while drawing
   */
  private oWhiteCircleIcon = new L.DivIcon({
    iconSize: new L.Point(1, 8), // Size of the icon (width, height)
    className: 'leaflet-div-icon leaflet-white-circle-marker', // Custom class for styling
    html: '' // No inner HTML, styling done via CSS
  });


  /**
   * Init options for leaflet-draw
   */
  m_oDrawOptions: any = {
    position: 'topright',
    draw: {
      circle: { // <--- ADD shapeOptions HERE for circles
        shapeOptions: { color: '#e1aa07' } // Set the color here
      },
      circlemarker: false,
      marker: false,
      polyline: { // <--- ADD shapeOptions HERE for polylines (if enabled)
        shapeOptions: { color: '#e1aa07' } // Set the color here
      },
      polygon: {
        shapeOptions: { color: '#e1aa07' }, // Already set for polygon
        showArea: false,
        icon: this.oWhiteCircleIcon
      },
      rectangle: { shapeOptions: { color: '#e1aa07' }, showArea: false }, // Already set for rectangle
    },
    edit: {
      featureGroup: this.m_oDrawnItems,
      edit: false,
      remove: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topleft',
      },
    },
  };

  m_oMagicToolResultSubject= new Subject<string>()
  m_aoDrawnItems: L.FeatureGroup;
  m_oLastCircle: L.Circle | null = null;
  m_oLastMarker: L.Marker | null = null;
  m_oGeoJsonLayer: L.GeoJSON | null = null;
  m_bIsDrawCreated: boolean = false;
  m_bIsAutoDrawCreated: boolean = false;
  m_bIsImportDrawCreated: boolean = false;
  m_oImportShapeMarker: L.Marker | null = null;
  m_oDrawMarker: L.Marker | null = null;
  m_oFeatureInfoMarker = null;

  /*
   a list of layers that are being selected , this help keep track and eventually used for layer analyzer and pixel info
   */
  m_aoSelectedLayers = []

  /**
   * Flag to know if the pixel info tool should be enabled
   */
  m_bPixelInfoOn: boolean = false;

  m_aoMarkers: L.Marker[] = [];
  m_aoAreaPolygons: L.Polygon[] = [];
  m_aoEventMarkers: L.Marker[] = [];
  m_oMarkerSubject = new BehaviorSubject<AreaViewModel>(null);
  /**
   * Manual Bounding Box Event Listener
   */
  m_oManualBoundingBoxSubscription: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  m_oMarkerSubject$ = this.m_oMarkerSubject.asObservable();
  m_oObjectUrlCache = new Map<string,string>; // Map to store ObjectURLs for cached tiles
  m_oCircleDrawnSubject = new Subject<{
    center: { lat: number; lng: number };
    radius: number;
  }>();
  m_oActiveShapeForMagicTool: L.Layer | null = null; // Track the currently drawn shape
  private m_oLayerMap: { [key: string]: L.TileLayer.WMS } = {};
  public m_oLayerAnalyzerDialogEventEmitter = new EventEmitter<boolean>();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oHttp: HttpClient,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService
  ) {
  }

  setMapOptions() {
    this.m_oOptions = {
      layers: [this.m_oDarkGrayArcGIS],
      zoomControl: false,
      zoom: 3,
      // worldCopyJump: true, // This enables the seamless world wrapping for markers
      noWrap:true,
      // center: latLng(0, 0),
      edit: {featureGroup: this.m_oDrawnItems},
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topleft',
      },
    };
  }

  /**
   * Set the map object(when created not by the service)
   * @param oMap
   */
  setMap(oMap: any) {
    this.m_oRiseMap = oMap;
  }

  /**
   * Get the Map object
   * @returns {null | *}
   */
  getMap() {
    return this.m_oRiseMap;
  }

  /**
   * Initialize base layers
   */
  initTilelayer() {
    // Basic OSM Layer
    this.m_oOSMBasic = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: MapZoomLevels.STANDARD_MAX_ZOOM,
        minZoom: MapZoomLevels.STANDARD_MIN_ZOOM,
        // this option disables loading tiles outside the world bounds.
        noWrap: true,
      }
    );

    // Topo Map
    this.m_oOpenTopoMap = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: MapZoomLevels.DEFAULT_MAX_ZOOM,
        minZoom: MapZoomLevels.DEFAULT_MIN_ZOOM,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        noWrap: true,
      }
    );

    // Esri Streets
    this.m_oEsriWorldStreetMap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: MapZoomLevels.STREET_MAX_ZOOM,
        minZoom: MapZoomLevels.STREET_MIN_ZOOM,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
        noWrap: true,
      }
    );

    // Esri Images
    this.m_oEsriWorldImagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: MapZoomLevels.IMAGERY_MAX_ZOOM,
        minZoom: MapZoomLevels.IMAGERY_MIN_ZOOM,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        noWrap: true,
      }
    );

    // Stadi Dark
    this.m_oStadiMapDark = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      {
        minZoom: MapZoomLevels.DARK_MIN_ZOOM,
        maxZoom: MapZoomLevels.DARK_MAX_ZOOM,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
        // ext: 'png'
      }
    );

    this.m_oDarkGrayArcGIS = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: MapZoomLevels.DARK_MIN_ZOOM,
        maxZoom: MapZoomLevels.DARK_MAX_ZOOM,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
        // ext: 'png'
      }
    );

    // Add all to the layers control
    this.m_oLayersControl = L.control.layers(
      {
        Standard: this.m_oOSMBasic,
        "Topology ": this.m_oOpenTopoMap,
        "Street": this.m_oEsriWorldStreetMap,
        "World Imagery": this.m_oEsriWorldImagery,
        // 'Stadi Map Dark': this.m_oStadiMapDark,
        'Dark': this.m_oDarkGrayArcGIS,
      },
      null,
      {position: 'bottomright'}
    );
  }


  setActiveLayer(oMap: L.Map, oMapLayer: L.TileLayer) {
    if (this.m_oActiveBaseLayer !== oMapLayer) {
      this.m_oActiveBaseLayer = oMapLayer;
      oMap.addLayer(oMapLayer);
    }

    const activeLayer = this.getActiveLayer();

    // Clear existing tileloadstart listeners
    activeLayer.off('tileloadstart');
    activeLayer.off('tileload');

    // Handle tile loading
    activeLayer.on('tileloadstart', async (event: { tile: any }) => {
      const url = event.tile.src;
      const cachedObjectUrl = this.m_oObjectUrlCache.get(url);

      if (cachedObjectUrl) {
        // Use the cached ObjectURL
        event.tile.src = cachedObjectUrl;
        return;
      }

      try {
        const cachedTile = await this.getTileFromCache(url);
        if (cachedTile) {
          const objectUrl = URL.createObjectURL(cachedTile);
          this.m_oObjectUrlCache.set(url, objectUrl); // Cache the ObjectURL
          event.tile.src = objectUrl;
        }else {
          // Tile is not in the cache, fetch it from the network
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch tile from network: ${response.statusText}`);
          }

          const blob = await response.blob();

          // Cache the fetched tile
          await this.cacheTiles(url, blob);

          // Update the tile's source
          const objectUrl = URL.createObjectURL(blob);
          this.m_oObjectUrlCache.set(url, objectUrl); // Cache the ObjectURL
          event.tile.src = objectUrl;
        }
      } catch (error) {
        console.error('Error during tile load:', error);
      }
    });

    // Cleanup ObjectURLs when tiles are removed
    activeLayer.on('tileunload', (event: { tile: any }) => {
      const url = event.tile.src;
      const objectUrl = this.m_oObjectUrlCache.get(url);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl); // Revoke the ObjectURL
        this.m_oObjectUrlCache.delete(url); // Remove it from the cache
      }
    });
  }

  getActiveLayer() {
    return this.m_oActiveBaseLayer;
  }

  /**
   * Set Drawn Items
   */
  setDrawnItems() {
    this.m_oDrawnItems = new L.FeatureGroup();
  }


  /**
   * Convert Point from WKT to Lat,Lng
   * @param oPoint
   */
  convertPointLatLng(oPoint) {
    if (oPoint.markerCoordinates) {

      let aoCoordinates: any = wktToGeoJSON(oPoint.markerCoordinates);

      aoCoordinates = geoJSON(aoCoordinates).getBounds();

      return aoCoordinates;
    }
    return null;
  }


  convertCircleToWKT(
    center: { lat: number; lng: number },
    radius: number
  ): string {
    const numPoints = 64; // Number of points to approximate the circle
    const points = [];
    const earthRadius = 6371000; // Radius of the Earth in meters

    for (let i = 0; i < numPoints; i++) {
      const angle = (((i * 360) / numPoints) * Math.PI) / 180; // Convert to radians
      const latOffset =
        ((radius * Math.cos(angle)) / earthRadius) * (180 / Math.PI);
      const lngOffset =
        ((radius * Math.sin(angle)) /
          (earthRadius * Math.cos((center.lat * Math.PI) / 180))) *
        (180 / Math.PI);
      const lat = center.lat + latOffset;
      const lng = center.lng + lngOffset;
      points.push([lng, lat]);
    }
    // Close the polygon by repeating the first point at the end
    points.push([points[0][0], points[0][1]]);
    return `POLYGON((${points.map((p) => `${p[0]} ${p[1]}`).join(', ')}))`;
  }

  /**
   * Add Layer Map 2D By Server
   * @param sLayerId
   * @param sServer
   * @param iOpacity
   */
  addLayerMap2DByServer(sLayerId: string, sServer: string, iOpacity?:number) {

    if (!sLayerId) {
      return false;
    }
    //TODO: add default server
    // if(!sServer) {
    //   sServer
    // }
    let oMap = this.getMap();

    let oWmsLayer = L.tileLayer.wms(sServer, {
      layers: sLayerId,
      format: 'image/png',
      transparent: true,
      noWrap: true,
      opacity:iOpacity!=null?iOpacity/100:100
    });

    // if (!FadeoutUtils.utilsIsObjectNullOrUndefined(iZIndex)){
    //   oWmsLayer.setZIndex(1000+iZIndex);
    // }
    oWmsLayer.setZIndex(1000)
    oWmsLayer.addTo(oMap);
    // Store the layer in the map for later reference
    this.m_oLayerMap[sLayerId] = oWmsLayer;
    return true;
  }

  /**
   * zoom B and Image On Geoserver Bounding Box
   * @param geoserverBoundingBox
   */
  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox) {
    try {
      if (!geoserverBoundingBox) {
        console.log('MapService.zoomBandImageOnGeoserverBoundingBox: geoserverBoundingBox is null or empty ');
        return;
      }

      geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, '');
      let oBounds = JSON.parse(geoserverBoundingBox);

      //Zoom on layer
      let corner1 = L.latLng(oBounds.maxy, oBounds.maxx),
        corner2 = L.latLng(oBounds.miny, oBounds.minx),
        bounds = L.latLngBounds(corner1, corner2);

      this.m_oRiseMap.flyToBounds(bounds, {maxZoom: 8});
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Close workspace
   */
  closeWorkspace() {
    this.m_oMarkerSubject.next(null);
  }


  /****** MAP BUTTONS ******/
  /**
   * Clear all drawing on map
   * @param oMap
   */
  clearPreviousDrawings(oMap) {
    if (!oMap) {
      oMap = this.getMap();
    }
    this.m_bIsDrawCreated = false;
    this.m_bIsAutoDrawCreated = false;
    this.m_bIsImportDrawCreated = false;

    // Clear all drawn shapes (polygons, circles, etc.)
    if (this.m_oDrawnItems) {
      this.m_oDrawnItems.clearLayers(); // Clear layers added by Leaflet Draw
    }

    // Clear manually added marker (from manual draw)
    if (this.m_oDrawMarker) {
      oMap.removeLayer(this.m_oDrawMarker);
      this.m_oDrawMarker = null; // Reset reference
    }

    // Clear any markers added from importing a shape file
    if (this.m_oImportShapeMarker) {
      oMap.removeLayer(this.m_oImportShapeMarker);
      this.m_oImportShapeMarker = null; // Reset reference
    }

    // Clear last circle drawn (from auto-draw or manual circle drawing)
    if (this.m_oLastCircle) {
      oMap.removeLayer(this.m_oLastCircle);
      this.m_oLastCircle = null; // Reset reference
    }

    // Clear last marker (in case a marker was placed, but the area was not a circle)
    if (this.m_oLastMarker) {
      oMap.removeLayer(this.m_oLastMarker);
      this.m_oLastMarker = null; // Reset reference
    }

    // Remove any previous GeoJSON layers (from imports or other drawing methods)
    if (this.m_oGeoJsonLayer) {
      oMap.removeLayer(this.m_oGeoJsonLayer);
      this.m_oGeoJsonLayer = null; // Reset reference
    }
    if (this.m_oGeocoderMarker) {
      oMap.removeLayer(this.m_oGeocoderMarker);
      this.m_oGeocoderMarker = null;
    }
  }

  /**
   * Handler function for drawing rectangles/polygons/etc. on map - Creates bounding box to string
   * @param oEvent
   * @param oMap
   */
  onDrawCreated(oEvent, oMap) {
    this.clearPreviousDrawings(oMap);
    const {layerType, layer} = oEvent;
    if (this.m_oGeocoderMarker) {
      this.m_oRiseMap.removeLayer(this.m_oGeocoderMarker);
      this.m_oGeocoderMarker = null; // Reset the marker reference
    }
    // For rectangle, calculate area
    if (layerType === 'rectangle' || layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0]; // Use the first array of latlngs
      const points = latlngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });
      // Calculate the centroid (center) of the polygon
      const centroid = this.calculateCentroid(points);
      if (this.m_oDrawMarker) {
        oMap.removeLayer(this.m_oDrawMarker);
      }
      this.m_oDrawMarker = L.marker([centroid.lat, centroid.lng],{icon:oIconDefault}).addTo(oMap);
    }
    // For circle, calculate area
    if (layerType === 'circle') {
      const radius = layer.getRadius(); // Radius in meters
      const center = oEvent.layer.getLatLng();
      if (this.m_oDrawMarker) {
        oMap.removeLayer(this.m_oDrawMarker);
      }
      this.m_oDrawMarker = L.marker([center.lat, center.lng],{icon:oIconDefault}).addTo(oMap);
      // alert(`Circle Area: ${(area / 1000000).toFixed(2)} square kilometers`);
    }

    this.m_oDrawnItems.addLayer(layer);
    this.m_bIsDrawCreated = true;
  }


  //Auto adjusting the area if it is too big or too small
  adjustCircleArea(layer, radius) {
    let newRadius;
    const area = Math.PI * radius * radius;
    if (area > MAX_AREA_CIRCLE) {
      newRadius = Math.sqrt(MAX_AREA_CIRCLE / Math.PI);
    } else if (area < MIN_AREA_CIRCLE) {
      newRadius = Math.sqrt(MIN_AREA_CIRCLE / Math.PI);
    }
    if (newRadius && newRadius !== radius) {
      layer.setRadius(newRadius);
    }
  }


  adjustRectangleDimensions(layer, width, height) {
    const bounds = layer.getBounds();
    const center = bounds.getCenter();

    // Adjust dimensions to fit within min/max constraints
    const adjustedWidth = Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH));
    const adjustedHeight = Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT));

    // Dynamic conversion factors
    const metersToLatitudeDegrees = (meters) => meters / 111_000;
    const metersToLongitudeDegrees = (meters, latitude) =>
      meters / (111_000 * Math.cos((latitude * Math.PI) / 180));

    // Convert adjusted dimensions to degrees
    const adjustedHeightDegrees = metersToLatitudeDegrees(adjustedHeight);
    const adjustedWidthDegrees = metersToLongitudeDegrees(
      adjustedWidth,
      center.lat
    );

    // Calculate new bounds based on the adjusted width and height in degrees
    const newBounds = [
      [
        center.lat - adjustedHeightDegrees / 2,
        center.lng - adjustedWidthDegrees / 2,
      ],
      [
        center.lat + adjustedHeightDegrees / 2,
        center.lng + adjustedWidthDegrees / 2,
      ],
    ];
    // Apply the new bounds to the rectangle
    layer.setBounds(newBounds);
  }

  /**
   * Init geo search plugin, the search bar for geographical reference on the map
   * @references https://github.com/perliedman/leaflet-control-geocoder
   */
  initGeoSearchPluginForOpenStreetMap(oMap) {
    if (!oMap) {
      oMap = this.m_oRiseMap;
    }

    if (!this.m_oGeocoderControl) {
      this.m_oGeocoderControl = L.Control.geocoder({
        defaultMarkGeocode: false
      });
    }

    const oGeocoderControl = this.m_oGeocoderControl;
    oGeocoderControl.addTo(oMap);

    // Clear any previous 'markgeocode' listeners to prevent multiple markers
    oGeocoderControl.off('markgeocode');

    oGeocoderControl.on('markgeocode', (event) => {
      this.clearPreviousDrawings(oMap);
      const aoLatLng = event.geocode.center;
      this.m_oGeocoderMarker = L.marker(aoLatLng,{icon:oGeoCoderIcon}).addTo(oMap);
      oMap.setView(aoLatLng, 14);
    });
  }

  /**
   * Adds Mouse Position and Scale to the actual map
   * @returns
   */
  addMousePositionAndScale(oMap,isDashboard:boolean) {
    if (oMap == null) {
      oMap = this.m_oRiseMap;
      // return;
    }
    // coordinates in map find this plugin in lib folder
    if(isDashboard){
      let oMousePosition = L.control.mousePosition({
        position:'bottomright'
      });
      if (oMousePosition != null) {
        oMousePosition.addTo(oMap);
      }
    }else{
      let oMousePosition = L.control.mousePosition({
        position:'bottomleft'
      });
      if (oMousePosition != null) {
        oMousePosition.addTo(oMap);
      }
    }

    L.control
      .scale({
        position: 'bottomright',
        imperial: false,
      })
      .addTo(oMap);
  }


  addMeasurementTools(oMap: L.Map): Observable<any> {
    const oResultSubject = new Subject<any>();
    let bMeasurementMode = false;
    let oActiveShape: L.Layer | null = null; // Track the currently drawn shape
    let oDrawControl: any = null; // Declare globally within the function

    const oMeasurementControl = L.Control.extend({
      options: {position: 'topright'},
      onAdd: () => {
        const oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const oMeasurementButton = L.DomUtil.create(
          'a',
          'leaflet-control-button',
          oContainer
        );
        oMeasurementButton.innerHTML =
          '<span class="material-symbols-outlined">architecture</span>'; // Measurement icon
        oMeasurementButton.title = 'Start Measurement';

        L.DomEvent.disableClickPropagation(oMeasurementButton);

        L.DomEvent.on(oMeasurementButton, 'click', () => {
          if (bMeasurementMode) return;
          bMeasurementMode = true;
          oContainer.innerHTML = '';

          // Add buttons for each tool
          const aoTools = [
            {icon: 'timeline', title: 'Draw Polyline', type: 'polyline'},
            {icon: 'hexagon', title: 'Draw Polygon', type: 'polygon'},
            {icon: 'circle', title: 'Draw Circle', type: 'circle'},
            {icon: 'rectangle', title: 'Draw Rectangle', type: 'rectangle'},
          ];

          aoTools.forEach((tool) => {
            const oToolButton = L.DomUtil.create(
              'a',
              'leaflet-control-button',
              oContainer
            );
            oToolButton.innerHTML = `<span class="material-symbols-outlined" style="color: var(--rise-gold);">${tool.icon}</span>`;
            oToolButton.title = tool.title;

            L.DomEvent.on(oToolButton, 'click', () => {

              switch (tool.type) {
                case 'rectangle':
                  oDrawControl = new L.Draw.Rectangle(
                    oMap,
                    this.m_oDrawOptions.draw.rectangle
                  );
                  break;
                case 'circle':
                  oDrawControl = new L.Draw.Circle(
                    oMap,
                    this.m_oDrawOptions.draw.circle
                  );
                  break;
                case 'polygon':
                  oDrawControl = new L.Draw.Polygon(
                    oMap,
                    this.m_oDrawOptions.draw.polygon
                  );
                  break;
                case 'polyline':
                  oDrawControl = new L.Draw.Polyline(
                    oMap,
                    this.m_oDrawOptions.draw.polyline
                  );
                  break;
              }
              oResultSubject.next(null)
              if (oDrawControl) {
                oResultSubject.next(null);
                this.startDrawing(oMap, oDrawControl, (layer,message,sWkt) => {
                  if (oActiveShape) {
                    oMap.removeLayer(oActiveShape);
                    oActiveShape = null;
                  }

                  // Set the new shape as active
                  oActiveShape = layer;
                  oResultSubject.next({message:message,wkt: sWkt});

                });
              }
            });
          });

          // Add a Cancel button
          const oCancelButton = L.DomUtil.create(
            'a',
            'leaflet-control-button',
            oContainer
          );
          oCancelButton.innerHTML =
            '<span class="material-symbols-outlined">close</span>';
          oCancelButton.title = 'Cancel';

          L.DomEvent.on(oCancelButton, 'click', () => {
            bMeasurementMode = false;
            oContainer.innerHTML = '';
            oMeasurementButton.innerHTML =
              '<span class="material-symbols-outlined">architecture</span>';
            oMeasurementButton.title = 'Start Measurement';
            oContainer.appendChild(oMeasurementButton);

            // Disable drawing if active
            if (oDrawControl) {
              oDrawControl.disable();
              oDrawControl = null; // Reset to avoid reuse
            }

            // Remove the current shape if it exists
            if (oActiveShape) {
              oMap.removeLayer(oActiveShape);
              oActiveShape = null;
            }

            // Emit cancel event
            oResultSubject.next({message:'Measurement cancelled.',sWkt:null});
          });

          oContainer.appendChild(oCancelButton);
        });

        return oContainer;
      },
    });

    oMap.addControl(new oMeasurementControl());

    return oResultSubject.asObservable();
  }


  startDrawing(
    oMap: L.Map,
    oDrawControl: any,
    onShapeCreated: (layer: L.Layer,message:string,sWkt:any) => void
  ) {

    oDrawControl.enable();

    oMap.once('draw:created', (e: any) => {
      const {layerType: sLayerType, layer} = e;

      // Temporary layer for measurement
      oMap.addLayer(layer);


      const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num); // Adds commas as thousand separators
      };
      // Calculate and create a notification sMessage
      let sMessage = '';
      let sWkt=''
      if (sLayerType === 'polyline') {
        const distance = this.calculateDistance(layer.getLatLngs());
        // from mm² to km²
        let distanceWithComas=formatNumber(distance)
        // sMessage = `Distance: ${(distance).toFixed(2)} kilometers`;
        sMessage = `Distance: ${distanceWithComas} kilometers`;
        sWkt=this.convertLatLngsToWktLineString(layer.getLatLngs());
      } else if (sLayerType === 'circle') {
        const iRadius = layer.getRadius();
        const area = this.calculateCircleArea(iRadius);
        let areaWithFormat = formatNumber(area/(Math.pow(10,6)));
        // sMessage = `Circle Area: ${(area / 1000).toFixed(2)} Km²`;
        sMessage = `Circle Area: ${areaWithFormat} Km²`;
        const oCenter=layer.getLatLng();
        sWkt=this.convertCircleToWKT(oCenter,iRadius);
      } else {
        const aiLatLngs = layer.getLatLngs()[0];
        const area = this.calculatePolygonArea(aiLatLngs);
        let areaWithFormat = formatNumber(area/(Math.pow(10,6)));
        // sMessage = `Circle Area: ${(area / 1000).toFixed(2)} Km²`;
        sMessage = `Area: ${areaWithFormat} Km²`;
        // sMessage = `Area: ${(area / 1000).toFixed(2)} Km²`;
        sWkt=this.convertLatLngsToWktPolygon(aiLatLngs)
      }
      // Call the callback with the new layer and sMessage
      onShapeCreated(layer,sMessage,sWkt)

    });
  }
  private convertLatLngsToWktLineString(latlngs: L.LatLng[]): string {
    const coords = latlngs.map(latlng => `${latlng.lng} ${latlng.lat}`).join(', ');
    return `LINESTRING (${coords})`;
  }
  private convertLatLngsToWktPolygon(latlngs: L.LatLng[]): string {
    // Ensure the polygon is closed (first and last point are the same)
    let closedLatLngs = [...latlngs];
    if (latlngs.length > 0 && !(latlngs[0].equals(latlngs[latlngs.length - 1]))) {
      closedLatLngs.push(latlngs[0]);
    }
    const coords = closedLatLngs.map(latlng => `${latlng.lng} ${latlng.lat}`).join(', ');
    return `POLYGON ((${coords}))`;
  }

  //todo find a better way to write only one drawing method
  startDrawingForMagicTool(
    oMap: L.Map,
    oDrawControl: any,
    onShapeCreated: (layer: L.Layer) => void
  ) {
    oDrawControl.enable();
    oMap.once('draw:created', (e: any) => {
      const {layerType: sLayerType, layer: oLayer} = e;
      onShapeCreated(oLayer)

      const aoSelectedLayers = this.getSelectedLayers(); // Retrieve selected layers

      let bOpenDialog = false;
      if (aoSelectedLayers!=null) {
        if  (aoSelectedLayers.length>0 ){
          let oAOIBbox = this.getMagicToolBbox(oLayer);
          if (oAOIBbox) {
            bOpenDialog = true;
            this.m_oMagicToolAOI = oAOIBbox; // Store the AOI for later use
          }
        }
      }

      if (bOpenDialog) {
        this.m_oMagicToolResultSubject.next('Shape intersects with a selected layer.');
        this.m_oLayerAnalyzerDialogEventEmitter.emit(true);

      }else{
        this.m_oMagicToolResultSubject.next('Shape does not intersect with any selected layer.');
        this.m_oLayerAnalyzerDialogEventEmitter.emit(false);
      }

      oMap.addLayer(oLayer);

    });
  }

  private getMagicToolBbox(oDrawnShape: L.Layer): L.LatLngBounds {

    // Check if the drawn shape is a Circle
    if (oDrawnShape instanceof L.Circle) {
      const oCircle = oDrawnShape as L.Circle;
      const oCircleCenter = oCircle.getLatLng();
      const oCircleRadius = oCircle.getRadius();

      // Calculate the bounds of the circle manually
      const oLatLngBounds = this.getCircleBounds(oCircleCenter, oCircleRadius);
      // Check if the circle's bounds intersect with the layer's bounds
      return oLatLngBounds;
    }

    if (oDrawnShape instanceof L.Rectangle || oDrawnShape instanceof L.Polygon) {
      // Check if the drawn shape's bounds intersect with the layer bounds
      const oDrawnBounds = (oDrawnShape as L.Rectangle | L.Polygon).getBounds();
      return oDrawnBounds;
    }
    console.warn(`Unsupported shape type: ${oDrawnShape.constructor.name}`);
    return null;

  }

  private isShapeCoveringServerLayer(oDrawnShape: L.Layer, sLayerId: string): boolean {
    const oLayer = this.m_oLayerMap[sLayerId];
    if (!oLayer) {
      console.warn(`Layer with ID ${sLayerId} not found on the map.`);
      return false;
    }
    // Get the bounding box of the WMS layer
    const oLayerBounds = this.getLayerBounds(oLayer);
    if (!oLayerBounds) {
      console.warn(`Could not retrieve bounds for layer ${sLayerId}`);
      return false;
    }

    // Check if the drawn shape is a Circle
    if (oDrawnShape instanceof L.Circle) {
      const oCircle = oDrawnShape as L.Circle;
      const circleCenter = oCircle.getLatLng();
      const circleRadius = oCircle.getRadius();

      // Calculate the bounds of the circle manually
      const latLngBounds = this.getCircleBounds(circleCenter, circleRadius);
      // Check if the circle's bounds intersect with the layer's bounds
      return oLayerBounds.intersects(latLngBounds);
    }

    if (oDrawnShape instanceof L.Rectangle || oDrawnShape instanceof L.Polygon) {
      // Check if the drawn shape's bounds intersect with the layer bounds
      const oDrawnBounds = (oDrawnShape as L.Rectangle | L.Polygon).getBounds();
      return oDrawnBounds.intersects(oLayerBounds)

    }
    console.warn(`Unsupported shape type: ${oDrawnShape.constructor.name}`);
    return false;

  }
// Function to calculate bounds of a circle manually
  private getCircleBounds(center: L.LatLng, radius: number): L.LatLngBounds {
    const lat = center.lat;
    const lng = center.lng;

    const earthRadius = 6371000; // Earth radius in meters

    // Calculate bounds of the circle based on center and radius
    const latDelta = radius / earthRadius * (180 / Math.PI); // Latitude in degrees
    const lngDelta = radius / (earthRadius * Math.cos(Math.PI * lat / 180)) * (180 / Math.PI); // Longitude in degrees

    const north = lat + latDelta;
    const south = lat - latDelta;
    const east = lng + lngDelta;
    const west = lng - lngDelta;

    return L.latLngBounds(L.latLng(south, west), L.latLng(north, east));
  }
  private getLayerBounds(oLayer: L.TileLayer.WMS): L.LatLngBounds | null {
    //TODO layer should have bounding box in entity
    const minx = 1.4998625311991;  // Longitude (West)
    const miny = 13.000169158400022;  // Latitude (South)
    const maxx = 3.4998716797628027;  // Longitude (East)
    const maxy = 15.000178306963724;  // Latitude (North)

    // Adjust the order to [latitude, longitude] as expected by Leaflet
    return L.latLngBounds([L.latLng(miny, minx), L.latLng(maxy, maxx)]);
  }


    // Function to parse WKT POLYGON string into an array of LatLng
  parseWKTPolygon(sWkt) {
    // Remove 'POLYGON ((' and '))' from the string
    const asCoordsString = sWkt.replace(/^POLYGON \(\(/, "").replace(/\)\)$/, "");

    // Split coordinates and convert them to Leaflet format [lat, lon]
    return asCoordsString.split(", ").map(fCoord => {
      const [fLon, fLat] = fCoord.split(" ").map(Number); // Swap order since Leaflet uses [lat, lon]
      return [fLat, fLon];
    });
  }

  /**
   * Add Area Marker
   * @param oArea
   * @param oMap
   */
  addAreaMarker(oArea: AreaViewModel, oMap: LeafletMap): Marker {

    try {
      let oCoordinates = this.convertPointLatLng(oArea);
      let asCoordinates = null;

      if(oCoordinates) {
        asCoordinates = oCoordinates._northEast;
      }

      if (asCoordinates && oMap) {
        let fLat = parseFloat(asCoordinates.lat);
        let fLon = parseFloat(asCoordinates.lng);

        // Get the coordinates (Note: duplicate of above? To be checked)
        const afBoundsCoords = this.parseWKTPolygon(oArea.bbox);

        for (let iCoordinates = afBoundsCoords.length-1; iCoordinates >=0 ; iCoordinates--) {

          try {
            afBoundsCoords[iCoordinates][0] = parseFloat(afBoundsCoords[iCoordinates][0]);
            afBoundsCoords[iCoordinates][1] = parseFloat(afBoundsCoords[iCoordinates][1]);

            if (isNaN(afBoundsCoords[iCoordinates][0]) || isNaN(afBoundsCoords[iCoordinates][1])) {
              console.error("Invalid coordinates: ", afBoundsCoords[iCoordinates]);
              afBoundsCoords.splice(iCoordinates, 1); // Remove invalid coordinates
            }
          }
          catch (oEx) {
            console.error("Error parsing coordinates: ", oEx);
            afBoundsCoords.splice(iCoordinates, 1);
          }
        }

        // Add the polygon to the map with only a gold contour
        let oPolygon = L.polygon(afBoundsCoords, {
          color: "#efba35", // Outline color
          weight: 1,
          fillOpacity: 0 // Removes fill color, only showing contour
        }).addTo(oMap);

        if (oPolygon) {
          this.m_aoAreaPolygons.push(oPolygon);
        }
        let sPrefix = "";

        let oIcon = oIconDefault;

        let oActualUser = this.m_oConstantsService.getUser();

        if (oActualUser) {
          // Change icon for shared areas
          if (oActualUser.organizationId != oArea.organizationId) {
            sPrefix = "Shared - ";
            oIcon = oIconShared;
          }
        }

        // Change icon for public areas
        if (oArea.publicArea) {
          sPrefix = "Public - ";
          oIcon = oIconPublic;
        }

        let oMarker = L.marker([fLat, fLon],{icon:oIcon})
          .bindTooltip(sPrefix + oArea.name)
          .on('click', () => {
            this.m_oMarkerSubject.next(oArea);
        });

        if (oMarker) {
          oMarker.addTo(oMap);
          this.m_aoMarkers.push(oMarker); // Store the marker in the array
          return oMarker;
        }

        return null;
      }
      return null;
    }
    catch (oEx) {
      console.error("Error adding area marker: ", oEx);
    }

    return null;
  }
  /**
   * Add Event Marker
   * @param oEvent
   * @param oMap
   */
  addEventMarker(oEvent: EventViewModel, oMap: LeafletMap): Marker {

    let asCoordinates = this.convertPointLatLng(oEvent);
    if(asCoordinates){
      asCoordinates=asCoordinates._northEast
    }

    if (asCoordinates && oMap) {
      let lat = parseFloat(asCoordinates.lat);
      let lon = parseFloat(asCoordinates.lng);
      let oMarker = L.marker([lat, lon],{icon:oIconDefault})
        .on('click', () => {
          this.m_oMarkerSubject.next(oEvent);
          // this.m_oMarkerClicked.emit(oArea);
          // this.m_oRouter.navigateByUrl('/monitor');
        })
      if (oMarker) {

        oMarker.addTo(oMap);
        this.m_aoEventMarkers.push(oMarker); // Store the marker in the array
        return oMarker;
      }
      return null;

    }
    return null;
  }

  clearMarkers(): void {

    this.m_aoAreaPolygons.forEach((oPolygon) => {
      oPolygon.remove();
    });

    this.m_aoAreaPolygons = [];

    this.m_aoMarkers.forEach((marker) => {
      marker.remove(); // Remove the marker from the map
    });

    this.m_aoMarkers = []; // Clear the marker array
  }

  /**
   * Clear Event Markers
   */
  clearEventMarkers(): void {
    this.m_aoEventMarkers.forEach((marker) => {
      marker.remove(); // Remove the marker from the map
    });
    this.m_aoEventMarkers = []; // Clear the marker array
  }

  /**
   * Fly to Monitor Bounds
   * @param sBbox
   */
  flyToMonitorBounds(sBbox: string): void {
    // Some sBbox-es return extra bracket, if true, trim the last bracket to avoid error
    if (sBbox.includes(')))')) {
      sBbox = sBbox.slice(0, -1);
    }
    let boundingBox: any = wktToGeoJSON(sBbox);
    boundingBox = geoJSON(boundingBox).getBounds();
    this.m_oRiseMap.fitBounds(boundingBox);
  }

  addImportButton(oMap: any) {
    let oController = this;
    const oImportButton = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: function (oMap) {
        // Create the container for the dialog
        let oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        // Create the button to add to leaflet
        let oButton = L.DomUtil.create(
          'a',
          'leaflet-control-button',
          oContainer
        );
        // Click stops on our button
        L.DomEvent.disableClickPropagation(oButton);

        L.DomEvent.on(oButton, 'click', function () {
          let oDialog = oController.m_oDialog.open(
            ImportShapeFileStationDialogComponent,
            {
              height: '425px',
              width: '660px',
            }
          );
          oDialog.afterClosed().subscribe((oResult) => {
            oController.clearPreviousDrawings(oMap);

            oController.m_oGeoJsonLayer = L.geoJSON(oResult).addTo(oMap);
            // GeoJSON coordinates are in [lng, lat] format, need to convert to [lat, lng]
            const latLngs = oResult.geometry.coordinates[0].map(
              (point: [number, number]) => {
                return L.latLng(point[1], point[0]); // Convert [lng, lat] to [lat, lng]
              }
            );
            // Prepare the points data
            const points = latLngs.map((point: L.LatLng) => {
              return {lat: point.lat, lng: point.lng};
            });
            // Calculate the centroid (center) of the polygon
            const centroid = oController.calculateCentroid(points);
            oController.m_oImportShapeMarker = L.marker([
              centroid.lat,
              centroid.lng,
            ],{icon:oIconDefault}).addTo(oMap);
            oMap.fitBounds(oController.m_oGeoJsonLayer.getBounds());
          });
        });

        oButton.innerHTML =
          '<span class="material-symbols-outlined">publish</span>';

        oContainer.title = 'Import Shape File';
        return oContainer;
      },
    });
    oMap.addControl(new oImportButton());
  }

  /**
   * Go to a position by inserting coords
   * @param oMap
   */
  addManualBbox(oMap: any) {
    const m_oManualBoxingButton = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd:  (oMap)=> {
        // Create the container for the dialog
        let oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        // Create the button to add to leaflet
        let oButton = L.DomUtil.create(
          'a',
          'leaflet-control-button',
          oContainer
        );

        // Click stops on our button
        L.DomEvent.disableClickPropagation(oButton);

        // And here we decide what to do with our button

        L.DomEvent.on(oButton, 'click',  ()=> {
          // We open the Manual Boundig Box Dialog
          let oDialog = this.m_oDialog.open(ManualBoundingBoxComponent);
          // Once is closed...
          oDialog.afterClosed().subscribe((oResult) => {
            if (oResult != null) {
              if (
                oResult.north == null ||
                oResult.west == null ||
                oResult.east == null ||
                oResult.south == null
              ) {
                return;
              } else {
                let fNorth = parseFloat(oResult.north);
                let fSouth = parseFloat(oResult.south);
                let fEast = parseFloat(oResult.east);
                let fWest = parseFloat(oResult.west);
                // Calculate the center of the bounds (midpoint of North-South and West-East)
                let fCenterLat = (fNorth + fSouth) / 2;
                let fCenterLng = (fWest + fEast) / 2;
                this.m_oLastMarker = L.marker([fCenterLat, fCenterLng],{icon:oIconDefault}).addTo(oMap);
                // Move the map to the center of the bounds and set a zoom level
                oMap.setView([fCenterLat, fCenterLng], 8);
                // Create the bounds array
                let geoJson = {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [fWest, fNorth], // Top-left
                      [fEast, fNorth], // Top-right
                      [fEast, fSouth], // Bottom-right
                      [fWest, fSouth], // Bottom-left
                      [fWest, fNorth], // Close Polygon
                    ],
                  ],
                };
                let aoBounds = [[fNorth, fWest], [fSouth, fEast]];
                this.addManualBboxLayer(oMap,aoBounds)
                this.m_oManualBoundingBoxSubscription.next({ geoJson, center: { lat: fCenterLat, lng: fCenterLng } });
              }
            }
          });
        });

        // This is the "icon" of the button added to Leaflet
        oButton.innerHTML =
          '<span class="material-symbols-outlined">pin_invoke</span>';

        oContainer.title = 'Manual Bounding Box';

        return oContainer;
      },
      onRemove: function (map) {
      },
    });
    oMap.addControl(new m_oManualBoxingButton());
    return this.m_oManualBoundingBoxSubscription.asObservable();
  }


  addManualBboxLayer(oMap, aoBounds) {
    let oLayer = L.rectangle(aoBounds, { color: "#3388ff", weight: 1 });

    //remove old shape
    if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      this.m_oDrawnItems.clearLayers();
    }

    this.m_oDrawnItems.addLayer(oLayer);
    this.zoomOnBounds(aoBounds);
    //Emit bounding box to listening component:
    return aoBounds
  }

  addPixelInfoToggle(oMap: any) {
    // Inject global style once
    const styleId = 'pixel-info-toggle-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
  .leaflet-control-button.active {
    color: white !important;

  }

  .leaflet-control-button.active .material-symbols-outlined {
    color: var(--rise-gold) !important; /* Or any color you want */
  }
`;
      document.head.appendChild(style);
    }

    let oPixelButton = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: () => {
        let oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        let oButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        let oCancelButton: HTMLElement | null = null;

        L.DomEvent.disableClickPropagation(oButton);

        L.DomEvent.on(oButton, 'click', () => {
          this.m_bPixelInfoOn = true;

          // Add active style
          oButton.classList.add('active');

          if (this.m_bPixelInfoOn) {
            // Change cursor style when Pixel Info is active
            oMap.getContainer().style.cursor = 'crosshair';
            if (!oCancelButton) {
              oCancelButton = L.DomUtil.create('a', 'leaflet-control-cancel', oContainer);
              oCancelButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
              oCancelButton.title = 'Cancel Pixel Info';

              L.DomEvent.on(oCancelButton, 'click', () => {
                this.m_bPixelInfoOn = false;

                // Remove active style
                oButton.classList.remove('active');
                oMap.getContainer().style.cursor = '';  // Reset cursor
                oContainer.removeChild(oCancelButton!);
                oCancelButton = null;

                this.m_oNotificationService.openSnackBar(
                  'Pixel Info operation canceled.',
                  'Pixel Info',
                  'danger'
                );
              });
            }

            this.getPixelInfo();
          }
        });

        oButton.innerHTML = '<span class="material-symbols-outlined">pinch</span>';
        oButton.title = 'Toggle Pixel Info';

        return oContainer;
      },
      onRemove: function (map) {
        // Clean-up if necessary
      },
    });

    oMap.addControl(new oPixelButton());
  }

  /**
   * Zoom on bounds
   * @param aBounds
   * @param oMap
   * @returns {boolean}
   */
  zoomOnBounds(aBounds, oMap = null): boolean {
    try {
      if (!aBounds) { return false; }
      if (aBounds.length == 0) { return false; }
      if (oMap == null && this.m_oRiseMap == null) { return false; }

      if (oMap == null) oMap = this.m_oRiseMap;

      oMap.flyToBounds([aBounds]);

      return true;
    }
    catch (e) {
      console.log(e);
    }
    return true;
  };


  getPixelInfo() {

    let sErrorMsg: string = this.m_oTranslate.instant('MAP.ERROR_LAYER');

    this.m_oRiseMap.on('click', async  (oClickEvent) => {

      //flag is false , button is not clicked
      if(!this.m_bPixelInfoOn) return;

      //there are not layer selected
      if (!this.m_aoSelectedLayers || this.m_aoSelectedLayers.length === 0) {
        this.m_oNotificationService.openSnackBar(
          'No layer selected, please select one',
          'Pixel Info',
          'danger'
        );
        window.dispatchEvent(new Event('resize'));
        return;
      }
      let sWmsUrl = '';
      let asMapIds :string[]= [];
      let asLayerIds :string[]= [];

      this.m_oRiseMap.eachLayer( (oLayer) => {
        if (oLayer.options.layers) {
          let sLayerId = oLayer.options.layers;

          // Find the selected layer by its ID
          let oSelectedLayer = this.m_aoSelectedLayers.find(layer => layer.layerId === sLayerId);
          asMapIds.push(oSelectedLayer?.mapId || 'Unknown');


          //todo maybe this is the reason why pixel info does not work on the shape files
          if (FadeoutUtils.utilsIsStrNullOrEmpty(oLayer._url)) {
            sWmsUrl = oLayer.url.replace('ows', 'wms');
          }
          //todo detect if the click position include the layer
          asLayerIds.push(oLayer.options.layers);
        }
      });

      // We query the layers one by one
      let oFullFeatures = null;

      for (let i = 0; i < asLayerIds.length; i++) {
        // Get the layer id
        let sLayerId = asLayerIds[i];

        // Get the WMS Url
        let sFeatureInfoUrl = this.getWMSLayerInfoUrl(
          sWmsUrl,
          oClickEvent.latlng,
          [sLayerId]
        );

        let sMapId = asMapIds[i];

        if (sFeatureInfoUrl) {
          try {

            // Fetch the feature info for the current layer
            const oResponse = await firstValueFrom(this.getFeatureInfo(sFeatureInfoUrl));

            for (let i = 0; i < oResponse["features"].length; i++) {
              oResponse["features"][i].id = sMapId;
            }

            if (oFullFeatures== null) {
              // Initialize oFullFeatures with the first response
              oFullFeatures = oResponse;
            }
            else {
              // Merge the features from the current response into oFullFeatures
              oFullFeatures.features = oFullFeatures.features.concat(oResponse["features"]);
            }
          } catch (oEx) {
            console.error('Error fetching feature info:', oEx);
          }
        }
      }

      sErrorMsg = "Error fetching feature info from the server. Please try again later.";

      if (oFullFeatures) {
        try {
          let sContentString = this.formatFeatureJSON(oFullFeatures);
          //handle the case when there are no info
          if(sContentString==='<ul></ul>'){
            sContentString='<ul>No Information Found</ul>'
          }
          this.m_oFeatureInfoMarker = L.popup()
            .setLatLng([
              oClickEvent.latlng.lat,
              oClickEvent.latlng.lng,
            ])
            .setContent(sContentString)
            .openOn(this.m_oRiseMap);
        } catch (error) {
          this.m_oNotificationService.openSnackBar(
            sErrorMsg,
            '',
            'danger'
          );
        }
      }
      else {
        this.m_oNotificationService.openSnackBar(
          sErrorMsg,
          '',
          'danger'
        );
        window.dispatchEvent(new Event("resize"))
      }
    });
  }


  addPrinterButton(oMap: any): Observable<void> {
    const printButtonClick$ = new Subject<void>(); // Create a Subject to emit when the button is clicked

    let oController = this;
    const oPrintButton = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: function (oMap) {
        let oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        let oButton = L.DomUtil.create(
          'a',
          'leaflet-control-button',
          oContainer
        );

        L.DomEvent.disableClickPropagation(oButton);

        L.DomEvent.on(oButton, 'click', function () {
          // Emit a value through the Subject when the button is clicked
          printButtonClick$.next();
        });

        oButton.innerHTML =
          '<span class="material-symbols-outlined">print</span>';
        oContainer.title = 'Print Map View';

        return oContainer;
      },
      onRemove: function (map) {
        // It's good practice to complete the Subject when the control is removed,
        // especially if this control can be dynamically added/removed.
        printButtonClick$.complete();
      },
    });

    oMap.addControl(new oPrintButton());

    // Return the Subject as an Observable so consumers can subscribe to it
    return printButtonClick$.asObservable();
  }

  //todo delete
  buildGetCapabilitiesUrl(oLayer: any): string {
    const sBaseUrl = oLayer._url || oLayer.url;
    return `${sBaseUrl}?service=WMS&version=1.3.0&request=GetCapabilities`;
  }
  //todo delete
  async isClickInsideLayer(oLayer: any, oLatLng: L.LatLng): Promise<boolean> {
    const sLayerId = oLayer.options.layers.replace(/^rise:/, '');
    const sUrl = this.buildGetCapabilitiesUrl(oLayer);

    const xmlText = await fetch(sUrl).then(res => res.text());
    const oXml = new DOMParser().parseFromString(xmlText, "text/xml");

    const oLayerElems = oXml.querySelectorAll("Layer");

    for (const oElem of Array.from(oLayerElems)) {
      const oNameNode = oElem.querySelector("Name");
      if (oNameNode?.textContent === sLayerId) {
        // Try <BoundingBox CRS="EPSG:4326" ... />
        const oBBox = oElem.querySelector("BoundingBox[CRS='CRS:84']");
        if (oBBox) {
          const minx = parseFloat(oBBox.getAttribute("minx") || "0");
          const miny = parseFloat(oBBox.getAttribute("miny") || "0");
          const maxx = parseFloat(oBBox.getAttribute("maxx") || "0");
          const maxy = parseFloat(oBBox.getAttribute("maxy") || "0");

          const oBounds = L.latLngBounds(
            L.latLng(miny, minx),
            L.latLng(maxy, maxx)
          );

          return oBounds.contains(oLatLng);
        }

      }
    }

    return false; // If no matching layer or bbox found
  }

  /**
   * Select a point in map and rise draw a circle with minimum radius
   * @param oMap
   */
  addCircleButton(
    oMap: L.Map
  ): Observable<{ center: { lat: number; lng: number }; radius: number }> {
    let bIsDrawing = false;

    const circleButton = L.Control.extend({
      options: {position: 'topright'},
      onAdd: () => {
        const oContainer = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control'
        );

        const oDrawButton = L.DomUtil.create(
          'a',
          'leaflet-control-button',
          oContainer
        );
        oDrawButton.innerHTML =
          '<span class="material-symbols-outlined">input_circle</span>';
        oDrawButton.title = 'Automatically Insert a Circle';

        L.DomEvent.disableClickPropagation(oDrawButton);

        L.DomEvent.on(oDrawButton, 'click', () => {
          this.clearPreviousDrawings(oMap);
          bIsDrawing = true;

          const onMapClick = (e: L.LeafletMouseEvent) => {
            if (!bIsDrawing) return;

            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 62600; // Set the radius of the circle (in meters)

            this.m_oLastCircle = L.circle([fLat, fLng], {
              radius: fRadius,
            }).addTo(oMap);
            this.m_oLastMarker = L.marker([fLat, fLng],{icon:oIconDefault}).addTo(oMap);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);

            // Emit the circle data through the Subject
            this.m_oCircleDrawnSubject.next({
              center: {lat: fLat, lng: fLng},
              radius: fRadius,
            });
            // Don't complete the Subject here to allow future emissions

            oMap.off('click', onMapClick);
            bIsDrawing = false;
          };

          oMap.on('click', onMapClick);
        });

        return oContainer;
      },
    });

    oMap.addControl(new circleButton());

    // Return the Subject as an Observable to subscribe in the component
    return this.m_oCircleDrawnSubject.asObservable();
  }

  addMagicTool(oMap: L.Map):  Observable<string> {

    const oMagicToolButton = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const oContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        this.initializeDrawButton(oContainer, oMap);

        return oContainer;
      },
    });

    oMap.addControl(new oMagicToolButton());
    return this.m_oMagicToolResultSubject.asObservable();
  }
  cleanupPixelInfo() {
    // Disable pixel info functionality
    this.m_bPixelInfoOn = false;

  }
  /**
   * Initializes the Draw button in the container.
   */
  private initializeDrawButton(oContainer: HTMLElement, oMap: L.Map): void {
    oContainer.innerHTML = ''; // Clear the container

    const oDrawButton = L.DomUtil.create(
      'a',
      'leaflet-control-button',
      oContainer
    );
    oDrawButton.innerHTML =
      '<span class="material-symbols-outlined">graph_5</span>';
    oDrawButton.title = 'Layer Analyzer';

    L.DomEvent.on(oDrawButton, 'click', () => {
      this.cleanupPixelInfo()
      this.handleDrawButtonClick(oContainer, oMap);
    });
  }

  /**
   * Handles the click event for the Draw button.
   */
  private handleDrawButtonClick(oContainer: HTMLElement, oMap: L.Map): void {
    const aoSelectedLayers = this.getSelectedLayers();
    if (aoSelectedLayers.length > 0) {
      this.populateToolButtons(oContainer, oMap);
    } else {
      this.m_oMagicToolResultSubject.next('No layers selected.');
      this.m_oLayerAnalyzerDialogEventEmitter.emit(false);
    }
  }

  /**
   * Populates the container with tool buttons and a Cancel button.
   */
  private populateToolButtons(oContainer: HTMLElement, oMap: L.Map): void {
    oContainer.innerHTML = ''; // Clear for tool buttons

    const aoTools = [
      { icon: 'hexagon', title: 'Draw Polygon', type: 'polygon' },
      { icon: 'circle', title: 'Draw Circle', type: 'circle' },
      { icon: 'rectangle', title: 'Draw Rectangle', type: 'rectangle' },
    ];

    aoTools.forEach((tool) => {
      this.createToolButton(oContainer, oMap, tool);
    });

    this.createCancelButton(oContainer, oMap);
  }

  /**
   * Creates a single tool button for a specific drawing type.
   */
  private createToolButton(
    oContainer: HTMLElement,
    oMap: L.Map,
    tool: { icon: string; title: string; type: string }
  ): void {
    const oToolButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
    oToolButton.innerHTML = `<span class="material-symbols-outlined" style="color: var(--rise-gold);">${tool.icon}</span>`; // Set icon color to yellow
    oToolButton.title = tool.title;

    L.DomEvent.on(oToolButton, 'click', () => {
      this.handleToolClick(oMap, tool.type);
    });
  }

  /**
   * Handles the click event for a specific tool button.
   */
  private handleToolClick(oMap: L.Map, toolType: string): void {
    let oDrawControl: any;

    switch (toolType) {
      case 'rectangle':
        oDrawControl = new L.Draw.Rectangle(oMap, this.m_oDrawOptions.draw.rectangle);
        break;
      case 'circle':
        oDrawControl = new L.Draw.Circle(oMap, this.m_oDrawOptions.draw.circle);
        break;
      case 'polygon':
        oDrawControl = new L.Draw.Polygon(oMap, this.m_oDrawOptions.draw.polygon);
        break;
      case 'polyline':
        oDrawControl = new L.Draw.Polyline(oMap, this.m_oDrawOptions.draw.polyline);
        break;
    }

    if (oDrawControl) {
      // Implement your drawing start logic here
      this.startDrawingForMagicTool(oMap,oDrawControl,(layer) => {
        if (this.m_oActiveShapeForMagicTool) {
          oMap.removeLayer(this.m_oActiveShapeForMagicTool);
          this.m_oActiveShapeForMagicTool = null;
        }

        // Set the new shape as active
        this.m_oActiveShapeForMagicTool = layer;


      });
    }
  }

  /**
   * Creates a Cancel button to reset the container.
   */
  private createCancelButton(oContainer: HTMLElement, oMap: L.Map): void {
    const oCancelButton = L.DomUtil.create(
      'a',
      'leaflet-control-button',
      oContainer
    );
    oCancelButton.innerHTML =
      '<span class="material-symbols-outlined">close</span>';
    oCancelButton.title = 'Cancel';

    L.DomEvent.on(oCancelButton, 'click', () => {
      this.initializeDrawButton(oContainer, oMap); // Reset the Draw button
      if (this.m_oActiveShapeForMagicTool) {
        oMap.removeLayer(this.m_oActiveShapeForMagicTool);
        this.m_oActiveShapeForMagicTool = null; // Reset active shape
      }
    });

  }



  getSelectedLayers() {
    return this.m_aoSelectedLayers
  }

  setSelectedLayers(aoSelectedLayers: any) {
    this.m_aoSelectedLayers = aoSelectedLayers;
  }

  addZoom() {
    let oMap = this.m_oRiseMap;
    L.control.zoom({position: 'bottomright'}).addTo(oMap);
  }

  /**
   * Get the Legend image link of a given layer
   * @param oLayer
   * @returns string
   */
  getLegendUrl(oLayer): string {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer)) {
      return '';
    }

    let sGeoserverUrl: string = oLayer.geoserverUrl;

    // if (!sGeoserverUrl) {
    //   sGeoserverUrl = this.m_oConstantsService.getWmsUrlGeoserver();
    // }

    if (sGeoserverUrl.endsWith('?')) {
      sGeoserverUrl = sGeoserverUrl.replace('ows?', 'wms?');
    } else {
      sGeoserverUrl = sGeoserverUrl.replace('ows', 'wms?');
    }

    sGeoserverUrl =
      sGeoserverUrl +
      'request=GetLegendGraphic&format=image/png&WIDTH=12&HEIGHT=12&legend_options=fontAntiAliasing:true;fontSize:10&LEGEND_OPTIONS=forceRule:True&LAYER=';
    sGeoserverUrl = sGeoserverUrl + oLayer.layerId;

    return sGeoserverUrl;
  }

  getWMSLayerInfoUrl(
    sWmsUrl: string,
    oPoint: L.LatLng,
    sLayerIdList: string[]
  ): string {
    const sLayerIds = sLayerIdList.join(',');
    const oLat = oPoint.lat;
    const oLng = oPoint.lng;

    const aoBounds: L.LatLngBounds = L.latLngBounds(
      L.latLng(oLat - 0.0001, oLng - 0.0001),
      L.latLng(oLat + 0.0001, oLng + 0.0001)
    );
    const sVersion = '1.3.0';
    //set BBox
    const sBoundsString = [
      aoBounds.getSouth(),
      aoBounds.getWest(),
      aoBounds.getNorth(),
      aoBounds.getEast(),
    ].join(',');
    const sBbox =
      sVersion === '1.3.0' ? sBoundsString : aoBounds.toBBoxString();

    const oWmsParams = {
      request: 'GetFeatureInfo',
      service: 'WMS',
      info_format: 'application/json',
      query_layers: sLayerIds,
      feature_count: 10,
      version: sVersion,
      bbox: sBbox,
      layers: sLayerIds,
      height: 101,
      width: 101,
      buffer: 30
    };

    //set x/y or i/j
    oWmsParams[sVersion === '1.3.0' ? 'i' : 'x'] = 50;
    oWmsParams[sVersion === '1.3.0' ? 'j' : 'y'] = 50;

    //Set param version
    oWmsParams[sVersion === '1.3.0' ? 'crs' : 'srs'] = 'EPSG:4326';

    //build url with url and params
    //load data from server
    return sWmsUrl + L.Util.getParamString(oWmsParams, sWmsUrl);
  }



  /**
   * Return the content for an 'innerHTML' element to be read by the popup -> setContent()
   * example:
   * Type: string
   * - Gray Index: X.XXX
   */
  formatFeatureJSON(oJSON: any): string {
    if (!oJSON.features || oJSON.features.length === 0) {
      return `<ul><li>No Information Found</li></ul>`;
    }

    const asFeatureContent: string[] = oJSON.features.map((oFeature) => {
      const oProps = oFeature.properties;
      let sPropsHtml = '';

      let sFeatureId = oFeature.id;

      if (sFeatureId.startsWith('rise:')) {
        sFeatureId = sFeatureId.replace('rise:', '');
      }

      sPropsHtml += `<li><b>${sFeatureId}</b><ul>`;

      for (const sKey in oProps) {
        if (oProps.hasOwnProperty(sKey)) {
          sPropsHtml += `<li>${sKey}: ${oProps[sKey]}</li>`;
        }
      }

      sPropsHtml += '</ul></li>';
      //return `<li>Type: ${oFeature.type}<ul>${sPropsHtml}</ul></li>`;
      return sPropsHtml;
    });

    return `<ul>${asFeatureContent.join('')}</ul>`;
  }

  getFeatureInfo(sUrl: string) {
    const aoHeaders = new HttpHeaders()
      .set('Accept', 'text/html,application/xhtml+xml,application/xml')
      .set('Cache-Control', 'max-age=0');
    sUrl = this.m_oConstantsService.getWmsUrlGeoserver() + sUrl;
    return this.m_oHttp.get(sUrl, {headers: aoHeaders});
  }

  /****** CACHE RELATED ******/
  /**
   * Cache Tiles of the Map
   * @param tileUrl
   * @param blob
   */
  async cacheTiles(tileUrl: string, blob: Blob) {
    try {
      const db = await this.openIndexedDb();
      const transaction = db.transaction('tileStore', 'readwrite');
      const store = transaction.objectStore('tileStore');

      const tileData = { url: tileUrl, blob, timestamp: Date.now() };

      // Calculate total storage size and evict oldest tiles if needed
      let totalSize = await this.calculateTotalStorageSize(store);
      if (totalSize > MAX_STORAGE_SIZE) {
        console.log('Max storage limit exceeded. Evicting oldest tiles...');
        await this.evictOldestTiles(store);
      }

      store.put(tileData); // Add or update the tile in the store

      // Ensure transaction completion
      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(null);
        transaction.onerror = () => reject('Transaction failed');
      });
    } catch (error) {
      console.error('Error caching tile:', error);
    }
  }

  async getTileFromCache(url: string): Promise<Blob | null> {
    const db = await this.openIndexedDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tileStore', 'readonly');
      const store = transaction.objectStore('tileStore');
      const request = store.get(url);

      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject('Error retrieving tile from cache');
    });
  }

  /**
   * Calculate total storage size
   * @param store
   */

  // Modify calculateTotalStorageSize to accept a store as a parameter
  async calculateTotalStorageSize(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve, reject) => {
      let totalSize = 0;
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const tile = cursor.value;
          totalSize += tile.blob.size; // Add the size of each tile's blob
          cursor.continue();
        } else {
          resolve(totalSize); // Return the total size once all tiles are counted
        }
      };

      cursorRequest.onerror = (event) => {
        reject('Error calculating storage size');
      };
    });
  }

  /**
   * Evict the oldest tiles to free the storage
   * @param store
   */
  async evictOldestTiles(store: IDBObjectStore) {
    return new Promise((resolve, reject) => {
      const index = store.index('timestamp'); // Assuming there's an index on 'timestamp'
      const cursorRequest = index.openCursor(null, 'next'); // Iterate over tiles in order of oldest first

      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey); // Delete the oldest tile
          cursor.continue(); // Continue to the next tile (FIFO)
        } else {
          resolve('Eviction complete');
        }
      };

      cursorRequest.onerror = (event) => {
        reject('Error evicting tiles');
      };
    });
  }

  /**
   * Evict the oldest tiles to free the storage
   * @param url
   */
  // async getTileFromCache(url: string): Promise<Blob | null> {
  //   const db = await this.openIndexedDb();
  //
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction('tileStore', 'readonly');
  //     const store = transaction.objectStore('tileStore');
  //     const request = store.get(url); // Use 'url' as the key
  //
  //     request.onsuccess = (event) => {
  //       const result = request.result;
  //       if (result) {
  //         resolve(result.blob); // Return the tile's blob data
  //       } else {
  //         resolve(null); // Tile not found in cache
  //       }
  //     };
  //
  //     request.onerror = () => {
  //       reject('Error retrieving tile from cache');
  //     };
  //   });
  // }

  async openIndexedDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tileDB', 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tileStore')) {
          const tileStore = db.createObjectStore('tileStore', {
            keyPath: 'url',
          });
          tileStore.createIndex('timestamp', 'timestamp', {unique: false}); // Create an index on 'timestamp'
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject('Error opening IndexedDB');
      };
    });
  }

  /****** CALCULATIONS ******/
  /**
   * Calculate Area of a rectangle
   * @param southWest
   * @param northEast
   */
  calculateRectangleArea(southWest: L.LatLng, northEast: L.LatLng): number {
    const width = southWest.distanceTo(
      new L.LatLng(southWest.lat, northEast.lng)
    ); // Distance between the two points
    const height = southWest.distanceTo(
      new L.LatLng(northEast.lat, southWest.lng)
    );
    // Convert area from square meters to square kilometers
    return (width * height) / 1000000;
  }

  /**
   * Calculate Distance
   * @param latlngs
   */
  calculateDistance(latlngs: L.LatLng[]): number {
    let totalDistance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
      totalDistance += latlngs[i].distanceTo(latlngs[i + 1]); // Calculates distance in meters
    }
    return totalDistance / 1000;
  }

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

  calculatePolygonArea(latlngs: any) {
    return L.GeometryUtil.geodesicArea(latlngs);
  }

  calculateCircleArea(radius: any) {
    return Math.PI * Math.pow(radius, 2);
  }

  clearMarkerSubject() {
    //Important to complete the subject before creating a new one to prevent memory leaks
    this.m_oMarkerSubject.complete();
    this.m_oMarkerSubject = new BehaviorSubject<AreaViewModel | null>(null);
    this.m_oMarkerSubject$ = this.m_oMarkerSubject.asObservable();
  }

  getMagicToolAOI() {
    return this.m_oMagicToolAOI;
  }

  cleanMagicToolAOI() {
    this.m_oMagicToolAOI = null;
  }
  //todo this might be a repetition with calculate Centreoid method , keep only one of them and also make this map service
  calculateCenterFromWkt(sBbox: string): L.LatLng | null {
    if (!sBbox) {
      return null;
    }

    // Your existing WKT cleaning logic
    if (sBbox.includes(')))')) {
      sBbox = sBbox.slice(0, -1);
    }

    try {
      const oGeoJson = wktToGeoJSON(sBbox);

      if (!oGeoJson) {
        console.warn("Could not convert WKT to GeoJSON.");
        return null;
      }

      // Create a Leaflet GeoJSON layer from the GeoJSON object
      const oGeoJsonLayer = L.geoJSON(oGeoJson);

      // Get the aoBounds of the GeoJSON layer
      const aoBounds = oGeoJsonLayer.getBounds();

      if (!aoBounds.isValid()) {
        console.warn("Invalid aoBounds obtained from GeoJSON. Check WKT format.");
        return null;
      }

      // Get the oCenter of the aoBounds
      const oCenter = aoBounds.getCenter();

      return oCenter;
    } catch (error) {
      console.error("Error calculating center from WKT:", error);
      return null;
    }
  }
}

