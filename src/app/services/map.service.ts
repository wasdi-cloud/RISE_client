import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {AreaViewModel} from '../models/AreaViewModel';

import {MatDialog} from '@angular/material/dialog';

import Geocoder from 'leaflet-control-geocoder';
import {Coords, geoJSON, Map, Marker} from 'leaflet';
import 'leaflet-draw';
import 'leaflet-mouse-position';
import {BehaviorSubject, Observable, Subject, tap} from 'rxjs';
import {wktToGeoJSON} from '@terraformer/wkt';
import {ManualBoundingBoxComponent} from "../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";
import {
  ImportShapeFileStationDialogComponent
} from "../dialogs/import-shape-file-station-dialog/import-shape-file-station-dialog.component";
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

const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB for testing
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const MIN_AREA_CIRCLE = 10000 * 1000 * 1000; // 10,000 square kilometers in square meters
const MAX_AREA_CIRCLE = 1000000 * 1000 * 1000; // 1,000,000 square kilometers in square meters
const MAX_WIDTH = 1000 ; // 1,500 kilometers in meters
const MAX_HEIGHT = 1000; // 1,500 kilometers in meters
const MIN_WIDTH = 100; // 100 kilometers in meters
const MIN_HEIGHT = 100; // 100 kilometers in meters




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
  m_aoDrawnItems: L.FeatureGroup;
  m_oLastCircle: L.Circle | null = null;
  m_oLastMarker: L.Marker | null = null;
  oGeoJsonLayer: L.GeoJSON | null = null;
  m_bIsDrawCreated: boolean = false;
  m_bIsAutoDrawCreated: boolean = false;
  m_bIsImportDrawCreated: boolean = false;
  m_oImportShapeMarker: L.Marker | null = null;
  m_oDrawMarker: L.Marker | null = null;
  private m_oMarkerSubject = new BehaviorSubject<AreaViewModel>(null);
  m_oMarkerSubject$ = this.m_oMarkerSubject.asObservable();
  // Declare a Subject at the class level
  private circleDrawnSubject = new Subject<{ center: { lat: number; lng: number }; radius: number }>();

  constructor(private m_oDialog: MatDialog, private m_oRouter: Router) {
  }

  setMapOptions() {
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

  setActiveLayer(oMap,oMapLayer: L.TileLayer) {
    // this.loadTilesInitially(oMap,oMapLayer);
    if (this.m_oActiveBaseLayer !== oMapLayer) {
      this.m_oActiveBaseLayer = oMapLayer;
      oMap.addLayer(oMapLayer);
    }
    const activeLayer = this.getActiveLayer();

    activeLayer.off('tileloadstart');  // Remove any existing listener on this layer

    activeLayer.on('tileloadstart', async (event: { tile: { src: string; }; }) => {
      let oMap = this.getMap();
      const zoomLevel = oMap?.getZoom();
      if (zoomLevel && zoomLevel >= 3 && zoomLevel <= 13) {
        const url = event.tile.src;  // URL of the tile being loaded
        try {
          // Try to get the tile from the cache
          const cachedTile = await this.getTileFromCache(url);

          if (cachedTile) {
            // Use the cached tile

            event.tile.src = URL.createObjectURL(cachedTile);  // Set the tile's source to the cached blob
          } else {
            // Tile was not found in cache, fetch it from the network
            // console.log('Tile not found in cache, fetching from network:', url);

            // Fetch the tile from the network
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const blob = await response.blob();

            // Cache the tile
            await this.cacheTiles(url, blob);


            const blobUrl = URL.createObjectURL(blob);
            event.tile.src = blobUrl;
          }
        } catch (error) {
          console.error('Error during tile load:', error);
        }
      } else {
        console.log("Zoom Levels needs to be between 10 and 13 for cache to work")
      }


    });
  }

  // async loadTilesInitially(oMap, oMapLayer: L.TileLayer) {
  //   const zoomLevel = oMap.getZoom();
  //
  //   // Check if the zoom level is within the allowed range
  //   if (zoomLevel < 3 || zoomLevel > 13) {
  //     console.log("Zoom level needs to be between 3 and 13 for cache to work");
  //     return;
  //   }
  //
  //   const tileBounds = oMap.getPixelBounds(); // Get bounds of the current map view in pixels
  //   const tileSize = oMapLayer.options.tileSize as number; // Default tile size is 256px
  //   const tilesInView = {
  //     xMin: Math.floor(tileBounds.min.x / tileSize),
  //     yMin: Math.floor(tileBounds.min.y / tileSize),
  //     xMax: Math.ceil(tileBounds.max.x / tileSize),
  //     yMax: Math.ceil(tileBounds.max.y / tileSize),
  //   };
  //
  //
  //   // Loop through each tile in the visible range
  //   for (let x = tilesInView.xMin; x <= tilesInView.xMax; x++) {
  //     for (let y = tilesInView.yMin; y <= tilesInView.yMax; y++) {
  //
  //       const tileUrl =oMapLayer.getTileUrl(<Coords>{x:x,y:y,z:zoomLevel as number})
  //
  //       try {
  //         const cachedTile = await this.getTileFromCache(tileUrl);
  //
  //         if (cachedTile) {
  //
  //           console.log("Initial Tile loaded from cache:", tileUrl);
  //           const blobUrl = URL.createObjectURL(cachedTile);
  //           // Instead of directly changing tile's src, you can listen to the 'tileload' event
  //           oMapLayer.on('tileload', (event) => {
  //             if (event.tile.src === tileUrl) {
  //               event.tile.src = blobUrl; // Set the tile's source to the cached Blob URL
  //             }
  //           });
  //         } else {
  //           // Tile was not found in cache, fetch it from the network
  //           console.log("Initially Tile not found in cache, fetching from network:", tileUrl);
  //
  //           // Fetch the tile from the network
  //           const response = await fetch(tileUrl);
  //           if (!response.ok) {
  //             throw new Error('Network response was not ok');
  //           }
  //           const blob = await response.blob();
  //
  //           // Cache the tile
  //           await this.cacheEsriTile(tileUrl, blob);
  //
  //           // Create a Blob URL for the fetched tile
  //           const blobUrl = URL.createObjectURL(blob);
  //           // Do something with blobUrl here if needed for the initial load
  //           // Set the tile's source to the cached blob;
  //           // Listen to 'tileload' for setting the source as before
  //           oMapLayer.on('tileload', (event) => {
  //             if (event.tile.src === tileUrl) {
  //               event.tile.src = blobUrl; // Set the tile's source
  //             }
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Error loading tile initially:", error);
  //       }
  //     }
  //   }
  // }






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
   * Initialize Wasdi Map
   * @param sMapDiv
   */
  initWasdiMap(sMapDiv: string): void {
    this.m_oRiseMap = this.initMap(sMapDiv);
  }

  /**
   * Initialize Map
   * @param sMapDiv
   */
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
    // this.m_oDarkGrayArcGIS.addTo(oMap);
    this.m_oOSMBasic.addTo(oMap);

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
    if (!oMap) {
      oMap = this.m_oRiseMap;
    }


    if (!this.m_oGeocoderControl) {
      this.m_oGeocoderControl = L.geocoder();
    }

    const oGeocoderControl = this.m_oGeocoderControl;
    oGeocoderControl.addTo(oMap);

    // Clear any previous 'markgeocode' listeners to prevent multiple markers
    oGeocoderControl.off('markgeocode');

    oGeocoderControl.on('markgeocode', (event) => {
      this.clearPreviousDrawings(oMap);
      const aoLatLng = event.geocode.center;
      this.m_oGeocoderMarker = L.marker(aoLatLng).addTo(oMap);
      oMap.setView(aoLatLng, 14);
    });
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
    const area = (width * height) / 1000000; // Convert area from square meters to square kilometers
    return area;
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

  /**
   * Add Marker
   * @param oArea
   * @param oMap
   */
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

  /**
   * Fly to Monitor Bounds
   * @param sBbox
   */
  flyToMonitorBounds(sBbox: string) {
    let boundingBox: any = wktToGeoJSON(sBbox.slice(0, -1));
    boundingBox = geoJSON(boundingBox).getBounds();
    this.m_oRiseMap.fitBounds(boundingBox);
  }

  /**
   * Convert Point from WKT to Lat,Lng
   * @param oArea
   */
  convertPointLatLng(oArea) {
    if (oArea.markerCoordinates) {
      let aoCoordinates: any = wktToGeoJSON(oArea.markerCoordinates);
      aoCoordinates = geoJSON(aoCoordinates).getBounds();
      return aoCoordinates;
    }
    return null;
  }

  /**
   * Add Layer Map 2D By Server
   * @param sLayerId
   * @param sServer
   */
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

  /**
   * zoom B and Image On Geoserver Bounding Box
   * @param geoserverBoundingBox
   */
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

  /**
   * Close workspace
   */
  closeWorkspace() {
    this.m_oMarkerSubject.next(null);
  }

  /**
   * Clear all drawing on map
   * @param oMap
   */
  clearPreviousDrawings(oMap) {
    if(!oMap){
      oMap=this.getMap();
    }
    this.m_bIsDrawCreated = false;
    this.m_bIsAutoDrawCreated = false;
    this.m_bIsImportDrawCreated = false;

    // Clear all drawn shapes (polygons, circles, etc.)
    if (this.m_oDrawnItems) {
      this.m_oDrawnItems.clearLayers();  // Clear layers added by Leaflet Draw
    }

    // Clear manually added marker (from manual draw)
    if (this.m_oDrawMarker) {
      oMap.removeLayer(this.m_oDrawMarker);
      this.m_oDrawMarker = null;  // Reset reference
    }

    // Clear any markers added from importing a shape file
    if (this.m_oImportShapeMarker) {
      oMap.removeLayer(this.m_oImportShapeMarker);
      this.m_oImportShapeMarker = null;  // Reset reference
    }

    // Clear last circle drawn (from auto-draw or manual circle drawing)
    if (this.m_oLastCircle) {
      oMap.removeLayer(this.m_oLastCircle);
      this.m_oLastCircle = null;  // Reset reference
    }

    // Clear last marker (in case a marker was placed, but the area was not a circle)
    if (this.m_oLastMarker) {
      oMap.removeLayer(this.m_oLastMarker);
      this.m_oLastMarker = null;  // Reset reference
    }

    // Remove any previous GeoJSON layers (from imports or other drawing methods)
    if (this.oGeoJsonLayer) {
      oMap.removeLayer(this.oGeoJsonLayer);
      this.oGeoJsonLayer = null;  // Reset reference
    }
    if(this.m_oGeocoderMarker){
      oMap.removeLayer(this.m_oGeocoderMarker);
      this.m_oGeocoderMarker=null;
    }
  }

  /**
   * Go to a position by inserting coords
   * @param oMap
   */
  addManualBbox(oMap: any) {
    let oController = this;
    const m_oManualBoxingButton = L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: function (oMap) {

        // Create the container for the dialog
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        // Create the button to add to leaflet
        let oButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);

        // Click stops on our button
        L.DomEvent.disableClickPropagation(oButton);

        // And here we decide what to do with our button

        L.DomEvent.on(oButton, 'click', function () {
          // We open the Manual Boundig Box Dialog
          let oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent, {
            height: '420px',
            width: '600px'
          });
          // Once is closed...
          oDialog.afterClosed().subscribe(oResult => {
            if (oResult != null) {

              if (oResult.north == null || oResult.west == null || oResult.east == null || oResult.south == null) {
                return;
              } else {
                let fNorth = parseFloat(oResult.north);
                let fSouth = parseFloat(oResult.south);
                let fEast = parseFloat(oResult.east);
                let fWest = parseFloat(oResult.west);
                // Calculate the center of the bounds (midpoint of North-South and West-East)
                let fCenterLat = (fNorth + fSouth) / 2;
                let fCenterLng = (fWest + fEast) / 2;

                // Move the map to the center of the bounds and set a zoom level
                oMap.setView([fCenterLat, fCenterLng], 13);
              }

            }

          })
        });

        // This is the "icon" of the button added to Leaflet
        oButton.innerHTML = '<span class="material-symbols-outlined">pin_invoke</span>';

        oContainer.title = "Manual Bounding Box";

        return oContainer;
      },
      onRemove: function (map) {
      },
    })
    oMap.addControl(new m_oManualBoxingButton());
  }

  /**
   * Handler function for drawing rectangles/polygons/etc on map - Creates bounding box to string
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
    if (layerType === 'rectangle' ||layerType === 'polygon' ) {
      const latlngs = layer.getLatLngs()[0]; // Use the first array of latlngs
      const points = latlngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });
      // Calculate the centroid (center) of the polygon
      const centroid = this.calculateCentroid(points);
      if(this.m_oDrawMarker){
        oMap.removeLayer(this.m_oDrawMarker);

      }
      this.m_oDrawMarker = L.marker([centroid.lat, centroid.lng]).addTo(oMap);
    }
    // For circle, calculate area
    if (layerType === 'circle') {
      const radius = layer.getRadius(); // Radius in meters
      const center = oEvent.layer.getLatLng();
      const area = this.calculateCircleArea(radius); // Area of the circle (πr²)
      if(this.m_oDrawMarker){
        oMap.removeLayer(this.m_oDrawMarker);

      }
      this.m_oDrawMarker = L.marker([center.lat, center.lng]).addTo(oMap);
      // alert(`Circle Area: ${(area / 1000000).toFixed(2)} square kilometers`);
    }

    this.m_oDrawnItems.addLayer(layer);
    this.m_bIsDrawCreated = true;
  }

  /**
   * Select a point in map and rise draw a circle with minimum radius
   * @param oMap
   */
  addCircleButton(oMap: L.Map): Observable<{ center: { lat: number; lng: number }; radius: number }> {
    let bIsDrawing = false;

    const circleButton = L.Control.extend({
      options: {position: "topright"},
      onAdd: () => {
        const oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        const oDrawButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        oDrawButton.innerHTML = '<span class="material-symbols-outlined">adjust</span>';
        oDrawButton.title = "Draw Circle";

        const oCancelButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        oCancelButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        oCancelButton.title = "Cancel Drawing";

        L.DomEvent.disableClickPropagation(oDrawButton);
        L.DomEvent.disableClickPropagation(oCancelButton);

        L.DomEvent.on(oDrawButton, 'click', () => {
          this.clearPreviousDrawings(oMap);
          bIsDrawing = true;

          const onMapClick = (e: L.LeafletMouseEvent) => {
            if (!bIsDrawing) return;

            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 500000; // Set the radius of the circle (in meters)

            this.m_oLastCircle = L.circle([fLat, fLng], {radius: fRadius}).addTo(oMap);
            this.m_oLastMarker = L.marker([fLat, fLng]).addTo(oMap);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);

            // Emit the circle data through the Subject
            this.circleDrawnSubject.next({center: {lat: fLat, lng: fLng}, radius: fRadius});
            // Don't complete the Subject here to allow future emissions

            oMap.off('click', onMapClick);
            bIsDrawing = false;
          };

          oMap.on('click', onMapClick);
        });

        L.DomEvent.on(oCancelButton, 'click', () => {
          if (this.m_oLastCircle) {
            oMap.removeLayer(this.m_oLastCircle);
            this.m_oLastCircle = null; // Reset reference
          }
          if (this.m_oLastMarker) {
            oMap.removeLayer(this.m_oLastMarker);
            this.m_oLastMarker = null; // Reset reference
          }
          bIsDrawing = false;
          oMap.off('click');
        });

        return oContainer;
      },
    });

    oMap.addControl(new circleButton());

    // Return the Subject as an Observable to subscribe in the component
    return this.circleDrawnSubject.asObservable();
  }

  /**
   * Import shape file
   * @param oMap
   */
  openImportDialog(oMap: L.Map): Observable<any> {
    let oDialog = this.m_oDialog.open(ImportShapeFileStationDialogComponent, {height: '425px', width: '660px'});
    return oDialog.afterClosed().pipe(
      tap(oResult => {
        this.clearPreviousDrawings(oMap);

        this.oGeoJsonLayer = L.geoJSON(oResult).addTo(oMap);
        // GeoJSON coordinates are in [lng, lat] format, need to convert to [lat, lng]
        const latLngs = oResult.geometry.coordinates[0].map((point: [number, number]) => {
          return L.latLng(point[1], point[0]); // Convert [lng, lat] to [lat, lng]
        });
        // Prepare the points data
        const points = latLngs.map((point: L.LatLng) => {
          return {lat: point.lat, lng: point.lng};
        });
        // Calculate the centroid (center) of the polygon
        const centroid = this.calculateCentroid(points);
        this.m_oImportShapeMarker = L.marker([centroid.lat, centroid.lng]).addTo(oMap);
        oMap.fitBounds(this.oGeoJsonLayer.getBounds());
      })
    );
  }
  /**
   * Cache Tiles of the Map
   * @param tileUrl
   * @param blob
   */
  async cacheTiles(tileUrl: string, blob: Blob) {
    try {
      // Open the IndexedDB and store the tile
      const db = await this.openIndexedDb();
      const transaction = db.transaction('tileStore', 'readwrite');
      const store = transaction.objectStore('tileStore');

      // Calculate total storage size within the transaction
      let totalSize = await this.calculateTotalStorageSize(store);
      console.log(`Current total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

      const tileData = {
        url: tileUrl,
        blob: blob,
        timestamp: Date.now()
      };

      // If the total size exceeds the limit, evict oldest tiles
      if (totalSize > MAX_STORAGE_SIZE) {
        console.log('Max storage limit exceeded. Evicting oldest tiles...');
        await this.evictOldestTiles(store);  // Pass the store to avoid transaction issues
      }

      // After eviction (if needed), put the new tile in the same transaction
      const request = store.put(tileData);  // Use 'put' to add or update the tile

      request.onsuccess = () => {
        // console.log('Tile cached:', tileUrl);
      };

      request.onerror = () => {
        // console.error('Error caching tile:', tileUrl);
      };

      // Ensure the transaction is complete
      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(null);
        transaction.onerror = () => reject('Transaction failed');
      });

    } catch (error) {
      console.error('Error caching tile:', error);
    }
  }
  /**
   * Calculate total storage size
   * @param store
   */

  async calculateTotalStorageSize(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve, reject) => {
      let totalSize = 0;
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const tile = cursor.value;
          totalSize += tile.blob.size;  // Add the size of each tile's blob
          cursor.continue();
        } else {
          resolve(totalSize);  // Return the total size once all tiles are counted
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
      console.log(store.index('timestamp'))
      const index = store.index('timestamp');  // Assuming there's an index on 'timestamp'
      const cursorRequest = index.openCursor(null, 'next');  // Iterate over tiles in order of oldest first

      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey);  // Delete the oldest tile
          cursor.continue();  // Continue to the next tile (FIFO)
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
  async getTileFromCache(url: string): Promise<Blob | null> {
    const db = await this.openIndexedDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tileStore', 'readonly');
      const store = transaction.objectStore('tileStore');
      console.log(url)
      const request = store.get(url);  // Use 'url' as the key

      request.onsuccess = (event) => {
        const result = request.result;
        if (result) {
          resolve(result.blob);  // Return the tile's blob data
        } else {
          resolve(null);  // Tile not found in cache
        }
      };

      request.onerror = () => {
        reject('Error retrieving tile from cache');
      };
    });
  }

  async openIndexedDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tileDB', 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tileStore')) {
          const tileStore = db.createObjectStore('tileStore', {keyPath: 'url'});
          tileStore.createIndex('timestamp', 'timestamp', {unique: false});  // Create an index on 'timestamp'
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

  //Auto adjusting the area if it is too big or too small
  adjustCircleArea(layer, area) {
    let newRadius;
    if (area > MAX_AREA_CIRCLE) {
      newRadius = Math.sqrt(MAX_AREA_CIRCLE / Math.PI);
    } else if (area < MIN_AREA_CIRCLE) {
      newRadius = Math.sqrt(MIN_AREA_CIRCLE / Math.PI);
    }
    if (newRadius) {
      layer.setRadius(newRadius);
    }
  }

  calculatePolygonArea(latlngs: any) {
    return L.GeometryUtil.geodesicArea(latlngs)

  }

  calculateCircleArea(radius: any) {
    return Math.PI * Math.pow(radius, 2)

  }

  adjustRectangleDimensions(layer, width, height) {
    const bounds = layer.getBounds();
    const center = bounds.getCenter();

    // Adjust dimensions to max or min constraints
    // Use max or min dimensions as needed
    const adjustedWidth = Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH));
    const adjustedHeight = Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT));


    const metersToDegrees = 0.000009; // Approximately for 1,000 meters scale

    // Calculate new bounds based on the adjusted width and height
    const newBounds = [
      [center.lat - (adjustedHeight / 2) * metersToDegrees, center.lng - (adjustedWidth / 2) * metersToDegrees],
      [center.lat + (adjustedHeight / 2) * metersToDegrees, center.lng + (adjustedWidth / 2) * metersToDegrees],
    ];
    layer.setBounds(newBounds); // Apply the new bounds to the rectangle
  }
  calculateCentroid(points: Array<{ lat: number, lng: number }>): { lat: number, lng: number } {
    let latSum = 0;
    let lngSum = 0;
    const numPoints = points.length;

    points.forEach(point => {
      latSum += point.lat;
      lngSum += point.lng;
    });

    // Return the average lat and lng to get the centroid
    return {
      lat: latSum / numPoints,
      lng: lngSum / numPoints
    };
  }
}
