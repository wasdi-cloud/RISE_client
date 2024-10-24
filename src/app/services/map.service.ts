import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {AreaViewModel} from '../models/AreaViewModel';

import {MatDialog} from '@angular/material/dialog';

import Geocoder from 'leaflet-control-geocoder';
import {geoJSON, Map, Marker} from 'leaflet';
import 'leaflet-draw';
import 'leaflet-mouse-position';
import {BehaviorSubject} from 'rxjs';
import {wktToGeoJSON} from '@terraformer/wkt';
// import L from 'leaflet';
declare const L: any;

const iconRetinaUrl = '/assets/rise-assets/icon-location-hazard-filled.png';
const iconUrl = '/assets/marker-icon.png';
const shadowUrl = '/assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

export interface TileLayer {
}

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

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
   * Init options for leaflet-draw
   */
  m_oDrawOptions: any = {
    position: 'topright',
    draw: {
      circle: true,
      circlemarker: false,
      marker: false,
      polyline: true,
      polygon: true,
      rectangle: {shapeOptions: {color: '#4AFF00'}, showArea: false},
    },
    edit: {
      featureGroup: new L.FeatureGroup(),
      edit: false,
      remove: false,
    },
  };
  private m_oMarkerSubject = new BehaviorSubject<AreaViewModel>(null);

  m_oMarkerSubject$ = this.m_oMarkerSubject.asObservable();

  constructor(private m_oDialog: MatDialog, private m_oRouter: Router) {
    this.initTilelayer();

    this.m_oOptions = {
      layers: [this.m_oDarkGrayArcGIS],
      zoomControl: false,
      zoom: 3,
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

  getOSMBasicLayer() {
    return this.m_oOSMBasic;
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
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        // this option disables loading tiles outside of the world bounds.
        noWrap: true,
      }
    );

    // Topo Map
    this.m_oOpenTopoMap = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }
    );

    // Esri Streets
    this.m_oEsriWorldStreetMap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
      }
    );

    // Esri Images
    this.m_oEsriWorldImagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    );

    // Stadi Dark
    this.m_oStadiMapDark = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'png'
      }
    );
    this.m_oDarkGrayArcGIS = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'png'
      }
    );

    // Add all to the layers control
    this.m_oLayersControl = L.control.layers(
      {
        Standard: this.m_oOSMBasic,
        OpenTopoMap: this.m_oOpenTopoMap,
        EsriWorldStreetMap: this.m_oEsriWorldStreetMap,
        EsriWorldImagery: this.m_oEsriWorldImagery,
        // 'Stadi Map Dark': this.m_oStadiMapDark,
        'Arcgis Dark gray Map': this.m_oDarkGrayArcGIS,
      },
      null,
      {position: 'bottomright'}
    );
  }

  /**
   * Set Drawn Items
   */
  setDrawnItems() {
    this.m_oDrawnItems = new L.FeatureGroup();
  }

  initWasdiMap(sMapDiv: string): void {
    this.m_oRiseMap = this.initMap(sMapDiv);
  }

  initMap(sMapDiv: string) {
    // Create the Map Object
    let oMap: L.Map = L.map(sMapDiv, {
      zoomControl: false,
      center: [0, 0],
      zoom: 6,
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
    });
    // this.m_oStadiMapDark.addTo(oMap);
    this.m_oDarkGrayArcGIS.addTo(oMap);
    // this.m_oOSMBasic.addTo(oMap);

    this.initGeoSearchPluginForOpenStreetMap(oMap);
    this.addMousePositionAndScale(oMap);
    L.control.zoom({position: 'bottomright'}).addTo(oMap);
    this.m_oLayersControl.addTo(oMap);

    // center map
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    let oActiveBaseLayer = this.m_oActiveBaseLayer;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      oActiveBaseLayer = e;
    });
    return oMap;
  }

  /**
   * Init geo search plugin, the search bar for geographical reference on the map
   * @references https://github.com/perliedman/leaflet-control-geocoder
   */
  initGeoSearchPluginForOpenStreetMap(oMap) {
    if (oMap == null) {
      oMap = this.m_oRiseMap;
    }

    if (this.m_oGeocoderControl == null) {
      this.m_oGeocoderControl = L.geocoder();
    }

    if (this.m_oGeocoderControl != null) {
      const geocoderControl = this.m_oGeocoderControl;
      geocoderControl.addTo(oMap);
      geocoderControl.on('markgeocode', (event) => {
        // Remove the existing marker if it exists
        if (this.m_oGeocoderMarker) {
          this.m_oRiseMap.removeLayer(this.m_oGeocoderMarker);
        }

        // Add a new marker based on the geocode result
        const latlng = event.geocode.center;
        this.m_oGeocoderMarker = L.marker(latlng,{iconDefault}).addTo(oMap);
      });

    }
  }

  /**
   * Adds Mouse Position and Scale to the actual map
   * @returns
   */
  addMousePositionAndScale(oMap) {
    if (oMap == null) {
      oMap = this.m_oRiseMap;
      return;
    }
    // coordinates in map find this plugin in lib folder
    // let oMousePosition = L.control.mousePosition();

    // if (oMousePosition != null) {
    //   oMousePosition.addTo(oMap);
    // }
    L.control
      .scale({
        position: 'bottomright',
        imperial: false,
      })
      .addTo(oMap);
  }

  /**
   * Handler function for drawing rectangles/polygons/etc on map - Creates bounding box to string
   * @param event
   */
  onDrawCreated(event: any) {
    const {layerType, layer} = event;
    if (this.m_oGeocoderMarker) {
      this.m_oRiseMap.removeLayer(this.m_oGeocoderMarker);
      this.m_oGeocoderMarker = null; // Reset the marker reference
    }
    // For rectangle, calculate area
    if (layerType === 'rectangle') {
      const bounds = layer.getBounds(); // Get the bounds of the rectangle
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const area = this.calculateRectangleArea(southWest, northEast);
      // alert(`Rectangle Area: ${area.toFixed(2)} square kilometers`);
    }

    // For polyline, calculate total distance
    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      const totalDistance = this.calculateDistance(latlngs);
      // alert(`Total distance: ${totalDistance.toFixed(2)} kilometers`);
    }

    // For polygon, calculate area
    if (layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0]; // Use the first array of latlngs
      const area = L.GeometryUtil.geodesicArea(latlngs); // Area in square meters
      // alert(`Polygon Area: ${(area / 1000000).toFixed(2)} square kilometers`);
    }

    // For circle, calculate area
    if (layerType === 'circle') {
      const radius = layer.getRadius(); // Radius in meters
      const area = Math.PI * Math.pow(radius, 2); // Area of the circle (πr²)
      // alert(`Circle Area: ${(area / 1000000).toFixed(2)} square kilometers`);
    }

    this.m_oDrawnItems.addLayer(layer);
  }

  calculateRectangleArea(southWest: L.LatLng, northEast: L.LatLng): number {
    const width = southWest.distanceTo(
      new L.LatLng(southWest.lat, northEast.lng)
    ); // Distance between the two points
    const height = southWest.distanceTo(
      new L.LatLng(northEast.lat, southWest.lng)
    );
    const area = (width * height) / 1000000; // Convert area from square meters to square kilometers
    return area;
  }

  calculateDistance(latlngs: L.LatLng[]): number {
    let totalDistance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
      totalDistance += latlngs[i].distanceTo(latlngs[i + 1]); // Calculates distance in meters
    }
    return totalDistance / 1000;
  }

  addMarker(oArea: AreaViewModel, oMap: Map): Marker {
    let asCoordinates = this.convertPointLatLng(oArea)._northEast;
    if (asCoordinates) {
      let lat = parseFloat(asCoordinates.lat);
      let lon = parseFloat(asCoordinates.lng);
      let oMarker = L.marker([lat, lon])
        .on('click', () => {
          this.m_oMarkerSubject.next(oArea);
          // this.m_oMarkerClicked.emit(oArea);
          // this.m_oRouter.navigateByUrl('/monitor');
        })
        .addTo(oMap);

      // .on('click', () => {
      //   console.log(oArea)
      //   this.m_oDialog.open(AreaInfoComponent, {
      //     data: {
      //       selectedArea: oArea
      //     }
      //   })
      // }).addTo(oMap)

      return oMarker;
    }
    return null;
  }

  flyToMonitorBounds(sBbox: string) {
    let boundingBox: any = wktToGeoJSON(sBbox.slice(0, -1));
    boundingBox = geoJSON(boundingBox).getBounds();
    this.m_oRiseMap.fitBounds(boundingBox);
  }

  convertPointLatLng(oArea) {
    if (oArea.markerCoordinates) {
      let aoCoordinates: any = wktToGeoJSON(oArea.markerCoordinates);
      aoCoordinates = geoJSON(aoCoordinates).getBounds();
      return aoCoordinates;
    }
    return null;
  }

  addLayerMap2DByServer(sLayerId: string, sServer: string) {
    if (!sLayerId) {
      return false;
    }
    //TODO: add default server
    // if(!sServer) {
    //   sServer
    // }
    let oMap = this.getMap();

    // console.log(sServer);
    // if (sServer.endsWith('?')) {
    //   sServer = sServer.replace('wms?', 'ows?');
    // } else {
    //   sServer = sServer.replace('ows', 'wms?');
    // }

    // console.log(sServer);
    let oWmsLayer = L.tileLayer.wms(sServer, {
      layers: sLayerId,
      format: 'image/png',
      transparent: true,
      noWrap: true,
    });
    // console.log(oWmsLayer);
    oWmsLayer.setZIndex(1000);
    oWmsLayer.addTo(oMap);

    return true;
  }

  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox) {
    try {
      if (!geoserverBoundingBox) {
        console.log(
          'MapService.zoomBandImageOnGeoserverBoundingBox: geoserverBoundingBox is null or empty '
        );
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
      console.log(e);
    }
  }

  closeWorkspace() {
    this.m_oMarkerSubject.next(null);
  }
}
