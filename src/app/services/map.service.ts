import { Injectable } from '@angular/core';

import Geocoder from 'leaflet-control-geocoder';
import * as L from "leaflet";
// import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
// import 'node_modules/leaflet-mouse-position/src/L.Control.MousePosition.js'

// declare var L: any;

export interface TileLayer {

}

@Injectable({
  providedIn: 'root'
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
   * Is the component toggle-able to 3D map? 
   */
  m_bIsToggle: boolean = false;

  /**
   * declare object for Layers Control options
   */
  m_oLayersControl: any;

  m_oWasdiMap: any;

  m_oActiveBaseLayer: any;

  m_oGeocoderControl: Geocoder = new Geocoder();


  constructor() {
    this.initTilelayer();
  }

  /**
   * Set the map object(when created not by the service)
   * @param oMap
   */
  setMap(oMap: any) {
    this.m_oWasdiMap = oMap;
  }

  /**
   * Get the Map object
   * @returns {null | *}
   */
  getMap() {
    return this.m_oWasdiMap;
  }

  getOSMBasicLayer() {
    return this.m_oOSMBasic;
  }

  /**
   * Initialize base layers
   */
  initTilelayer() {
    // Basic OSM Layer
    this.m_oOSMBasic = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this option disables loading tiles outside of the world bounds.
      noWrap: true
    });

    // Topo Map
    this.m_oOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Esri Streets
    this.m_oEsriWorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });

    // Esri Images
    this.m_oEsriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Stadi Dark
    this.m_oStadiMapDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: 'png'
    });

    // Add all to the layers control
    this.m_oLayersControl = L.control.layers(
      {
        'Standard': this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "Stadi Map Dark": this.m_oStadiMapDark
      }, null,
      { position: 'bottomright' }
    )
  }

  initWasdiMap(sMapDiv: string): void {
    this.m_oWasdiMap = this.initMap(sMapDiv);
  }

  initMap(sMapDiv: string) {
    // Create the Map Object
    let oMap: L.Map = L.map(sMapDiv, {
      zoomControl: false,
      center: [0, 0],
      zoom: 3,

    });
    this.m_oOSMBasic.addTo(oMap)

    this.initGeoSearchPluginForOpenStreetMap(oMap);
    this.addMousePositionAndScale(oMap);
    L.control.zoom({ position: 'bottomright' }).addTo(oMap);
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

    console.log(oMap)
    return oMap;
  }

  /**
  * Init geo search plugin, the search bar for geographical reference on the map
  * @references https://github.com/perliedman/leaflet-control-geocoder
  */
  initGeoSearchPluginForOpenStreetMap(oMap) {
    if (oMap == null) {
      oMap = this.m_oWasdiMap;
    }

    if (this.m_oGeocoderControl == null) {
      // this.m_oGeocoderControl = L.geocoder();
    }

    if (this.m_oGeocoderControl != null) {
      this.m_oGeocoderControl.addTo(oMap);
    }
  }

  /**
  * Adds Mouse Position and Scale to the actual map
  * @returns 
  */
  addMousePositionAndScale(oMap) {

    if (oMap == null) {
      oMap = this.m_oWasdiMap;
      return;
    }

    // coordinates in map find this plugin in lib folder
    // let oMousePosition = L.control.mousePosition();

    // if (oMousePosition != null) {
    //   oMousePosition.addTo(oMap);
    // }

    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);
  }
}
