import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";


declare const L: any;
import 'leaflet-draw'
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ManualBoundingBoxComponent} from "../../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {ImportShapeFileStationDialogComponent} from "../../dialogs/import-shape-file-station-dialog/import-shape-file-station-dialog.component";

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
export class RiseSelectAreaComponent  implements OnInit, AfterViewInit {


  /**
   * Map input as described by the User Interface
   */
  @Input() m_sMapTitle:string="default";

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

  constructor(private m_oDialog: MatDialog,private m_oMapService:MapService) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
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
  addManualBbox(oMap: any) {
    let oController = this;
    const m_oManualBoxingButton= L.Control.extend({
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
            if(oResult!=null){
              console.log(oResult)
              if(oResult.north ==null ||oResult.west ==null ||oResult.east ==null ||oResult.south ==null  ){
                return;
              }else{
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
            console.log('closed');
          })
        });

        // This is the "icon" of the button added to Leaflet
        oButton.innerHTML = '<span class="material-symbols-outlined">pin_invoke</span>';

        oContainer.title = "Manual Bounding Box";

        return oContainer;
      },
      onRemove: function (map) { },
    })
    oMap.addControl(new m_oManualBoxingButton());
  }
  onDrawCreated(oEvent) {
    // Clear previous circle and marker
    if (this.m_oLastCircle) {
      this.m_oMap.removeLayer(this.m_oLastCircle);
      this.m_oLastCircle = null;
    }
    if (this.m_oLastMarker) {
      this.m_oMap.removeLayer(this.m_oLastMarker);
      this.m_oLastMarker = null;
    }

    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);
    this.emitDrawnAreaEvent(oEvent);
  }

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
    }
    // Check if it's a polygon (including rectangles)
    else if (oEvent.layer instanceof L.Polygon) {
      const latLngs = oEvent.layer.getLatLngs()[0]; // Get the array of points (vertices)
      iSelectedArea = L.GeometryUtil.geodesicArea(latLngs); // Get the area of the polygon

      // Collect all points (vertices) of the polygon
      const points = latLngs.map((point: L.LatLng) => {
        return {lat: point.lat, lng: point.lng};
      });

      oShapeInfo = {
        type: 'polygon',
        points: points,
        area: iSelectedArea
      };
    }
    // Emit the shape information (area, points, center, radius) to the parent component
    this.m_oMapInputChange.emit(oShapeInfo);
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
          if (this.m_oDrawnItems) {

            this.m_oDrawnItems.clearLayers();
          } else {
            console.error("m_oDrawnItems is undefined or null.");
          }

          // Clear previous circle and marker
          if (this.m_oLastCircle) {
            oMap.removeLayer(this.m_oLastCircle);
          }
          if (this.m_oLastMarker) {
            oMap.removeLayer(this.m_oLastMarker);
          }



          // Set drawing flag to true
          bIsDrawing = true;

          // Function to create the circle on map click
          const onMapClick = (e: any) => {
            if (!bIsDrawing) return;

            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 500000; // Set the radius of the circle (in meters)

            // Add the new circle to the map
            this.m_oLastCircle = L.circle([fLat, fLng], { radius: fRadius }).addTo(oMap);
            this.m_oLastMarker = L.marker([fLat, fLng]).addTo(oMap);
            this.emitCircleButtonAreaEvent(fRadius, fLat, fLng);
            // Set view to the clicked location without zooming too much
            const currentZoom = oMap.getZoom();
            const targetZoom = Math.min(currentZoom, 13); // Ensure it doesn't zoom too much
            oMap.setView([fLat, fLng], targetZoom);

            // Remove the click listener after drawing
            oMap.off('click', onMapClick);
            bIsDrawing = false; // Reset the drawing flag
          };

          // Activate the map click listener for drawing the circle and adding the marker
          oMap.on('click', onMapClick);
        });

        // Add the cancel button click listener
        L.DomEvent.on(oCancelButton, 'click', () => {
          console.log("Cancel button clicked!");
          // Clear previous circle and marker
          if (this.m_oLastCircle) {
            oMap.removeLayer(this.m_oLastCircle);
          }
          if (this.m_oLastMarker) {
            oMap.removeLayer(this.m_oLastMarker);
          }
          // Stop listening for clicks and reset the flag
          bIsDrawing = false;
          // Emit null to reset the shape
          this.m_oMapInputChange.emit(null);
          oMap.off('click'); // Remove all click listeners to stop drawing
        });

        return oContainer;
      },
      onRemove: function (map) { },
    });

    // Add the control to the map
    oMap.addControl(new circleButton());
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

//todo work on import logic
  openImportDialog(): void {
    let oDialog=this.m_oDialog.open(ImportShapeFileStationDialogComponent, {
      height: '425px',
      width: '660px',
    })
    oDialog.afterClosed().subscribe(oResult => {
      if (oResult) {
        console.log(oResult); // The GeoJSON result from the dialog

        // Check if the map is defined
        if (this.m_oMap) {
          // Add GeoJSON to the map
          const geoJsonLayer = L.geoJSON(oResult, {
            style: function (feature) {
              return { color: "#ff7800", weight: 2 }; // You can customize the style
            },
            onEachFeature: function (feature, layer) {
              layer.bindPopup(`<b>Feature:</b> ${feature.properties.name || 'No Name'}`);
            }
          }).addTo(this.m_oMap);

          // Optionally, fit the map view to the bounds of the added GeoJSON layer
          this.m_oMap.fitBounds(geoJsonLayer.getBounds());
        } else {
          console.error('Map is not initialized.');
        }
      }
    });
  }
  addGeoJSONToMap(geojson: any) {
    if (this.m_oMap && geojson) {
      L.geoJSON(geojson).addTo(this.m_oMap); // Adds the GeoJSON layer to the map
      console.log('GeoJSON added to the map:', geojson);
    }
  }


}
