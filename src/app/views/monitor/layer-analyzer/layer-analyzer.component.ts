import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {RiseButtonComponent} from "../../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BuyNewSubscriptionComponent } from "../../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component";
import { ChangeDetectorRef } from '@angular/core';
import {RiseHistogramComponent} from "../../../components/rise-histogram/rise-histogram.component";
import L from 'leaflet';
import { LayerAnalyzerInputViewModel } from '../../../models/LayerAnalyzerInputViewModel';
import { LayerService } from '../../../services/api/layer.service';
import { NotificationsDialogsService } from '../../../services/notifications-dialogs.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layer-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    RiseButtonComponent,
    RiseTextInputComponent,
    TranslateModule,
    RiseHistogramComponent
  ],
  templateUrl: './layer-analyzer.component.html',
  styleUrl: './layer-analyzer.component.css'
})
export class LayerAnalyzerComponent implements OnInit{

  @Input() m_sOrganizationId: string = '';
  m_aoInputLayers: any[] = [];
  m_oAOI: any = L.LatLngBounds;
  m_sWKTAoi: string = "";

  m_sTotAreaPixels: string = '0';
  m_sEstimatedArea: string = '0';
  m_sPercentTotAreaAffectedPixels: string = '0';
  m_sPercentAreaAffectedPixels: string = '0';
  m_sAreaPixelAffected: string = '0';
  m_sFilterValue: string = 'None';
  m_bIsLoading: boolean = false;
  m_bStarted: boolean = false;
  m_sActiveLayerName: string = "";
  m_aiHistogramPixelValues: [];

  @Output() m_oEmitBack: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<BuyNewSubscriptionComponent>,
    private m_oLayerService: LayerService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oChangeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(){
    if (this.m_oData) { 
      this.m_aoInputLayers = this.m_oData.selectedLayers;
      if (this.m_aoInputLayers) {
        if (this.m_aoInputLayers.length>0){
          this.m_sActiveLayerName = this.m_aoInputLayers[0].pluginName
        }
      }
      this.m_oAOI = this.m_oData.aoiBbox;
      this.m_sWKTAoi = this.latLngBoundsToWKT(this.m_oAOI);
    } 
  }

  onRefresh() {

    let oInput = new LayerAnalyzerInputViewModel();
    oInput.layerIds = this.m_aoInputLayers.map((layer) => layer.id);
    oInput.bbox = this.m_sWKTAoi;

    this.m_bIsLoading = true;
    this.m_bStarted = true;
    this.m_oChangeDetectorRef.detectChanges();

    oInput.filter = null;

    if (this.m_sFilterValue) {  
      if (this.m_sFilterValue !== 'None') {
        try { 
          oInput.filter = parseFloat(this.m_sFilterValue).toString();
        }
        catch (oEX) {
          console.error('Error parsing filter value:', oEX);
        }
      }
    }

    
    this.m_oLayerService.analyzer(oInput).subscribe({
      next: (oResponse) => {
        if (oResponse) {
          this.m_sTotAreaPixels = oResponse.totAreaPixels;
          this.m_sEstimatedArea = oResponse.estimatedArea;
          this.m_sPercentTotAreaAffectedPixels = oResponse.percentTotAreaAffectedPixels;
          this.m_sPercentAreaAffectedPixels = oResponse.percentAreaAffectedPixels;
          this.m_sAreaPixelAffected = oResponse.areaPixelAffected;
          this.m_aiHistogramPixelValues = oResponse.histogram.map(sValue => parseInt(sValue, 10));;
          
        }
        this.m_bIsLoading = false;
        this.m_oChangeDetectorRef.detectChanges();
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(
          'There was an error analyzing the layer.',
          'danger',
          'Error'
        );
        this.m_bIsLoading = false;
        this.m_oChangeDetectorRef.detectChanges();
      },  
    })    

  }


  latLngBoundsToWKT(oBounds) {
    let oSouthWest = oBounds.getSouthWest();
    let oNorthEast = oBounds.getNorthEast();

    let sWkt = `POLYGON((${oSouthWest.lng} ${oSouthWest.lat}, ${oNorthEast.lng} ${oSouthWest.lat}, ${oNorthEast.lng} ${oNorthEast.lat}, ${oSouthWest.lng} ${oNorthEast.lat}, ${oSouthWest.lng} ${oSouthWest.lat}))`;
    
    return sWkt;
  }
  


  onDismiss() {
    this.m_oDialogRef.close();
  }

  onDownload() {
  }

  onExport() {

  }
}