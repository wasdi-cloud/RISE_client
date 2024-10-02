import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MapService} from "../../services/map.service";

import L from 'leaflet';
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
  //todo make sure only one tool of selecting area is active and therefore one area is selected

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
    this.m_oDrawnItems.clearLayers();
    this.m_oMapService.onDrawCreated(oEvent);

  }
//Handle when the user want to choose a position and let rise draw the minimum area around that point
  addCircleButton(oMap: any) {
    let lastCircle: L.Circle | null = null; // Keep track of the last drawn circle
    let lastMarker: L.Marker | null = null; // Keep track of the last added marker

    const circleButton = L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: function (oMap) {
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        // Create the button for drawing the circle
        let drawButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        drawButton.style.cursor = 'pointer'; // Change the cursor to pointer on hover
        drawButton.innerHTML = '<span class="material-symbols-outlined">adjust</span>';
        drawButton.title = "Draw Circle";

        // Create the cancel button to remove the circle
        let cancelButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);
        cancelButton.style.cursor = 'pointer'; // Change the cursor to pointer on hover
        cancelButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        cancelButton.title = "Cancel Drawing";

        // Disable map interaction on button click
        L.DomEvent.disableClickPropagation(drawButton);
        L.DomEvent.disableClickPropagation(cancelButton);

        // Add the draw button click listener
        L.DomEvent.on(drawButton, 'click', function () {
          // Create the function that will be triggered on map click
          const onMapClick = function (e: any) {
            const fLat = e.latlng.lat;
            const fLng = e.latlng.lng;
            const fRadius = 500000; // Set the radius of the circle (in meters)

            // Remove the old circle and marker if they exist
            if (lastCircle) {
              oMap.removeLayer(lastCircle);
            }
            if (lastMarker) {
              oMap.removeLayer(lastMarker);
            }

            // Add the new circle to the map
            lastCircle = L.circle([fLat, fLng], { radius: fRadius }).addTo(oMap);

            // Add a marker at the clicked location
            lastMarker = L.marker([fLat, fLng]).addTo(oMap);

            // Set view to the clicked location without zooming too much (custom zoom level)
            const currentZoom = oMap.getZoom();
            const targetZoom = Math.min(currentZoom, 13); // Ensure it doesn't zoom too much
            oMap.setView([fLat, fLng], targetZoom); // Adjust zoom level as needed

            // Remove the click listener after drawing the circle and marker
            oMap.off('click', onMapClick);
          };

          // Activate the map click listener for drawing the circle and adding the marker
          oMap.on('click', onMapClick);
        });

        // Add the cancel button click listener
        L.DomEvent.on(cancelButton, 'click', function () {
          // Remove the last drawn circle and marker if they exist
          if (lastCircle) {
            oMap.removeLayer(lastCircle);
            lastCircle = null; // Reset the lastCircle variable
          }
          if (lastMarker) {
            oMap.removeLayer(lastMarker);
            lastMarker = null; // Reset the lastMarker variable
          }
        });

        // Add hover effect: change button appearance on hover
        drawButton.onmouseover = () => {
          drawButton.style.backgroundColor = '#f0f0f0'; // Example hover effect
        };
        drawButton.onmouseout = () => {
          drawButton.style.backgroundColor = ''; // Reset background color when not hovering
        };

        cancelButton.onmouseover = () => {
          cancelButton.style.backgroundColor = '#f0f0f0'; // Example hover effect
        };
        cancelButton.onmouseout = () => {
          cancelButton.style.backgroundColor = ''; // Reset background color when not hovering
        };

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
