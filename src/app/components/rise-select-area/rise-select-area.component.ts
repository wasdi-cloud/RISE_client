import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";
import 'leaflet-draw'
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ManualBoundingBoxComponent} from "../../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {
  ImportShapeFileStationDialogComponent
} from "../../dialogs/import-shape-file-station-dialog/import-shape-file-station-dialog.component";
import {
  ConfirmInsertedAreaDialogComponent
} from "../../dialogs/confirm-inserted-area-dialog/confirm-inserted-area-dialog.component";


declare const L: any;

@Component({
  selector: 'rise-select-area',
  standalone: true,
  imports: [
    LeafletDrawModule,
    LeafletModule,
    RiseTimebarComponent,
    NgIf,
    RiseButtonComponent,

  ],
  templateUrl: './rise-select-area.component.html',
  styleUrl: './rise-select-area.component.css'
})
/**
 * RISE Select Area User Control
 */
export class RiseSelectAreaComponent implements OnInit, AfterViewInit {


  /**
   * Map input as described by the User Interface
   */
  @Input() m_sMapTitle: string = "default";

  /**
   * Event about map changed
   */
  @Output() m_oMapInputChange = new EventEmitter;

  m_oMap: L.Map;

  m_oMapOptions: any;

  m_oDrawnItems: any;

  m_oDrawOptions: any;
  m_oActiveBaseLayer: any;
  m_aoDrawnItems: L.FeatureGroup;
  m_oLastCircle: L.Circle | null = null;
  m_oLastMarker: L.Marker | null = null;
  oGeoJsonLayer: L.GeoJSON | null = null;
  m_bIsDrawCreated: boolean = false;
  m_bIsAutoDrawCreated: boolean = false;
  m_bIsImportDrawCreated: boolean = false;
  m_oImportShapeMarker: L.Marker | null = null;
  m_oDrawMarker: L.Marker | null = null;


  constructor(private m_oDialog: MatDialog, private m_oMapService: MapService) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.clearPreviousDrawings();
  }

  onMapReady(oMap) {
    this.m_oMap = oMap;
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);
    oMap.addLayer(this.m_oMapService.m_oOSMBasic);

    this.m_oMapService.addMousePositionAndScale(oMap);
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
    this.addManualBbox(oMap);
    this.addCircleButton(oMap);
  }


  //Go to position by inserting coords
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
              console.log(oResult)
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

  //Confirm inserted area
  confirmInsertedArea(oEvent?: any, fRadius?: number, fLat?: number, fLng?: number, geoJson?: any) {
    let oDialog = this.m_oDialog.open(ConfirmInsertedAreaDialogComponent, {
      width: '400px',
      height: 'auto',
      minWidth: '300px',
      minHeight: '150px',
    });

    oDialog.afterClosed().subscribe(oResult => {
      if (oResult) {
        // Emit the appropriate area based on the shape creation method
        if (this.m_bIsImportDrawCreated && geoJson) {
          this.emitGeoJSONShapeInfo(geoJson);
        } else if (this.m_bIsDrawCreated && oEvent) {
          this.emitDrawnAreaEvent(oEvent);
        } else if (this.m_bIsAutoDrawCreated && fRadius !== undefined && fLat !== undefined && fLng !== undefined) {
          this.emitCircleButtonAreaEvent(fRadius, fLat, fLng);
        }
      } else {
        // Clear the area
        this.clearPreviousDrawings();
      }
    });
  }

  // Different ways to draw an area
  //Using leaflet drawings
  onDrawCreated(oEvent) {
    this.clearPreviousDrawings()
    this.m_oMapService.onDrawCreated(oEvent);
    this.m_bIsDrawCreated = true;
    this.confirmInsertedArea(oEvent);
    // this.emitDrawnAreaEvent(oEvent);
  }

  //Handle when the user want to choose a position and let rise draw the minimum area around that point
  addCircleButton(oMap: any) {
    let bIsDrawing = false; // Flag to track if drawing is active

    const circleButton = L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: (oMap) => {
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        // Create the button for drawing the circle
        let oDrawButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        oDrawButton.style.cursor = 'pointer'; // Change the cursor to pointer on hover
        oDrawButton.innerHTML = '<span class="material-symbols-outlined">adjust</span>';
        oDrawButton.title = "Draw Circle";

        // Create the cancel button
        let oCancelButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        oCancelButton.style.cursor = 'pointer';
        oCancelButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        oCancelButton.title = "Cancel Drawing";
        // Disable map interaction on button click
        L.DomEvent.disableClickPropagation(oDrawButton);
        L.DomEvent.disableClickPropagation(oCancelButton);

        // Add the draw button click listener
        L.DomEvent.on(oDrawButton, 'click', () => {
          // Clear previous layers and reset drawing
          this.clearPreviousDrawings();


          // Set drawing flag to true
          bIsDrawing = true;

          // Function to create the circle on map click
          const onMapClick = (e: any) => {
            if (!bIsDrawing) return;

            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 500000; // Set the radius of the circle (in meters)

            // Add the new circle to the map
            this.m_oLastCircle = L.circle([fLat, fLng], {radius: fRadius}).addTo(oMap);
            this.m_oLastMarker = L.marker([fLat, fLng]).addTo(oMap);

            // Set view to the clicked location without zooming too much
            const currentZoom = oMap.getZoom();
            const targetZoom = Math.min(currentZoom, 13); // Ensure it doesn't zoom too much
            oMap.setView([fLat, fLng], targetZoom);

            // Remove the click listener after drawing
            oMap.off('click', onMapClick);
            bIsDrawing = false; // Reset the drawing flag
            this.m_bIsAutoDrawCreated = true;
            this.confirmInsertedArea(null, fRadius, fLat, fLng);
            // this.emitCircleButtonAreaEvent(fRadius, fLat, fLng);
          };

          // Activate the map click listener for drawing the circle and adding the marker
          oMap.on('click', onMapClick);
        });

        // Add the cancel button click listener
        L.DomEvent.on(oCancelButton, 'click', () => {
          console.log("Cancel button clicked!");
          if (this.m_oLastCircle) {
            this.m_oMap.removeLayer(this.m_oLastCircle);
            this.m_oLastCircle = null; // Reset reference
          }
          if (this.m_oLastMarker) {
            this.m_oMap.removeLayer(this.m_oLastMarker);
            this.m_oLastMarker = null; // Reset reference
          }
          // Stop listening for clicks and reset the flag
          bIsDrawing = false;
          // Emit null to reset the shape
          this.m_oMapInputChange.emit(null);
          oMap.off('click'); // Remove all click listeners to stop drawing
        });

        return oContainer;
      },
      onRemove: function (map) {
      },
    });

    // Add the control to the map
    oMap.addControl(new circleButton());
  }

  //Import shape file
  openImportDialog(): void {
    let oDialog = this.m_oDialog.open(ImportShapeFileStationDialogComponent, {
      height: '425px',
      width: '660px',
    })
    // Declare a variable to hold the GeoJSON layer

    oDialog.afterClosed().subscribe(oResult => {
      if (oResult) {
        // Check if the map is defined
        if (this.m_oMap) {
          this.clearPreviousDrawings();
          // Add GeoJSON to the map
          this.oGeoJsonLayer = L.geoJSON(oResult, {
            style: function (feature) {
              return {color: "#ff7800", weight: 2}; // Customize the style
            },
            onEachFeature: function (feature, layer) {
              layer.bindPopup(`<b>Feature:</b> ${feature.properties.name || 'No Name'}`);
            }
          }).addTo(this.m_oMap);

          // Optionally, fit the map view to the bounds of the added GeoJSON layer
          this.m_oMap.fitBounds(this.oGeoJsonLayer.getBounds());
          this.m_bIsImportDrawCreated = true;
          this.confirmInsertedArea(null, null, null, null, oResult);
          // Emit the shape information from the GeoJSON
          // this.emitGeoJSONShapeInfo(oResult);
        } else {
          console.error('Map is not initialized.');
        }
      }
    });
  }

  //Clearing previous drawing so to ensure only one area is emitted
  clearPreviousDrawings() {
    this.m_bIsDrawCreated = false;
    this.m_bIsAutoDrawCreated = false;
    this.m_bIsImportDrawCreated = false;

    // Clear all drawn shapes (polygons, circles, etc.)
    if (this.m_oDrawnItems) {
      this.m_oDrawnItems.clearLayers();  // Clear layers added by Leaflet Draw
    }

    // Clear manually added marker (from manual draw)
    if (this.m_oDrawMarker) {
      this.m_oMap.removeLayer(this.m_oDrawMarker);
      this.m_oDrawMarker = null;  // Reset reference
    }

    // Clear any markers added from importing a shape file
    if (this.m_oImportShapeMarker) {
      this.m_oMap.removeLayer(this.m_oImportShapeMarker);
      this.m_oImportShapeMarker = null;  // Reset reference
    }

    // Clear last circle drawn (from auto-draw or manual circle drawing)
    if (this.m_oLastCircle) {
      this.m_oMap.removeLayer(this.m_oLastCircle);
      this.m_oLastCircle = null;  // Reset reference
    }

    // Clear last marker (in case a marker was placed, but the area was not a circle)
    if (this.m_oLastMarker) {
      this.m_oMap.removeLayer(this.m_oLastMarker);
      this.m_oLastMarker = null;  // Reset reference
    }

    // Remove any previous GeoJSON layers (from imports or other drawing methods)
    if (this.oGeoJsonLayer) {
      this.m_oMap.removeLayer(this.oGeoJsonLayer);
      this.oGeoJsonLayer = null;  // Reset reference
    }

    // Log and remove all layers except the base map layer


    console.log('Map and drawings cleared');
  }



  // Function to calculate the centroid of a polygon
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
          lng: center.lng
        },
        radius: radius,
        area: iSelectedArea
      };
      this.m_oDrawMarker = L.marker([center.lat, center.lng]).addTo(this.m_oMap);

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
        geoJson: oEvent.layer.toGeoJSON().geometry
      };
      this.m_oDrawMarker = L.marker([centroid.lat, centroid.lng]).addTo(this.m_oMap);
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
      area: fArea // Add area to the emitted shape info
    };
    this.m_oMapInputChange.emit(oShapeInfo);
  }

  private emitGeoJSONShapeInfo(geoJson: any) {
    let oShapeInfo = {};
    let iSelectedArea = 0;
    console.log(geoJson)
    if (geoJson.geometry.type === "Polygon") {
      // GeoJSON coordinates are in [lng, lat] format, need to convert to [lat, lng]
      const latLngs = geoJson.geometry.coordinates[0].map((point: [number, number]) => {
        return L.latLng(point[1], point[0]); // Convert [lng, lat] to [lat, lng]
      });

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
        geoJson: geoJson
      };
      this.m_oImportShapeMarker = L.marker([centroid.lat, centroid.lng]).addTo(this.m_oMap);

    } else if (geoJson.type === "circle") {
      //todo will have to test with file to verify
    }
    console.log(oShapeInfo)
    // Emit the shape information to the parent component
    this.m_oMapInputChange.emit(oShapeInfo);
  }


}
