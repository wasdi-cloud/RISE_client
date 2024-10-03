import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";

import L, {Circle, Marker} from 'leaflet';
// declare const L: any;
import 'leaflet-draw'
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {RiseTimebarComponent} from "../rise-timebar/rise-timebar.component";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ManualBoundingBoxComponent} from "../../dialogs/manual-bounding-box-dialog/manual-bounding-box.component";
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {ImportStationDialogComponent} from "../../dialogs/import-station-dialog/import-station-dialog.component";

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
  private lastCircle: L.Circle | null = null;
  private lastMarker: L.Marker | null = null;

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
    if (this.lastCircle) {
      this.m_oMap.removeLayer(this.lastCircle);
      this.lastCircle = null;
    }
    if (this.lastMarker) {
      this.m_oMap.removeLayer(this.lastMarker);
      this.lastMarker = null;
    }

    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);
  }
//Handle when the user want to choose a position and let rise draw the minimum area around that point
  addCircleButton(oMap: any) {
    let isDrawing = false; // Flag to track if drawing is active

    const circleButton = L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: (oMap) => {
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        // Create the button for drawing the circle
        let drawButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        drawButton.style.cursor = 'pointer'; // Change the cursor to pointer on hover
        drawButton.innerHTML = '<span class="material-symbols-outlined">adjust</span>';
        drawButton.title = "Draw Circle";

        // Create the cancel button
        let cancelButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        cancelButton.style.cursor = 'pointer';
        cancelButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        cancelButton.title = "Cancel Drawing";

        // Disable map interaction on button click
        L.DomEvent.disableClickPropagation(drawButton);
        L.DomEvent.disableClickPropagation(cancelButton);

        // Add the draw button click listener
        L.DomEvent.on(drawButton, 'click', () => {
          // Debug log to ensure the function is being called
          console.log("Circle button clicked!");

          // Clear previous layers and reset drawing
          if (this.m_oDrawnItems) {
            console.log("Clearing layers...");
            this.m_oDrawnItems.clearLayers();
          } else {
            console.error("m_oDrawnItems is undefined or null.");
          }

          // Clear previous circle and marker
          if (this.lastCircle) {
            oMap.removeLayer(this.lastCircle);
          }
          if (this.lastMarker) {
            oMap.removeLayer(this.lastMarker);
          }



          // Set drawing flag to true
          isDrawing = true;

          // Function to create the circle on map click
          const onMapClick = (e: any) => {
            if (!isDrawing) return;

            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 500000; // Set the radius of the circle (in meters)

            // Add the new circle to the map
            this.lastCircle = L.circle([fLat, fLng], { radius: fRadius }).addTo(oMap);
            this.lastMarker = L.marker([fLat, fLng]).addTo(oMap);

            // Set view to the clicked location without zooming too much
            const currentZoom = oMap.getZoom();
            const targetZoom = Math.min(currentZoom, 13); // Ensure it doesn't zoom too much
            oMap.setView([fLat, fLng], targetZoom);

            // Remove the click listener after drawing
            oMap.off('click', onMapClick);
            isDrawing = false; // Reset the drawing flag
          };

          // Activate the map click listener for drawing the circle and adding the marker
          oMap.on('click', onMapClick);
        });

        // Add the cancel button click listener
        L.DomEvent.on(cancelButton, 'click', () => {
          console.log("Cancel button clicked!");
          // Clear previous circle and marker
          if (this.lastCircle) {
            oMap.removeLayer(this.lastCircle);
          }
          if (this.lastMarker) {
            oMap.removeLayer(this.lastMarker);
          }
          // Stop listening for clicks and reset the flag
          isDrawing = false;
          oMap.off('click'); // Remove all click listeners to stop drawing
        });

        return oContainer;
      },
      onRemove: function (map) { },
    });

    // Add the control to the map
    oMap.addControl(new circleButton());
  }

  //todo work on import logic
  openImportDialog(): void {
    this.m_oDialog.open(ImportStationDialogComponent, {
      height: '425px',
      width: '660px',
    })
  }


}
