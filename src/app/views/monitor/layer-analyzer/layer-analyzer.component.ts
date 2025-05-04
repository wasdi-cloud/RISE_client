import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {RiseButtonComponent} from "../../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../../components/rise-text-input/rise-text-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BuyNewSubscriptionComponent
} from "../../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component";
import FadeoutUtils from "../../../shared/utilities/FadeoutUtils";
import {RiseHistogramComponent} from "../../../components/rise-histogram/rise-histogram.component";
import L from 'leaflet';
import { LayerAnalyzerInputViewModel } from '../../../models/LayerAnalyzerInputViewModel';
import { LayerService } from '../../../services/api/layer.service';

@Component({
  selector: 'app-layer-analyzer',
  standalone: true,
  imports: [
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

  @Output() m_oEmitBack: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<BuyNewSubscriptionComponent>,
    private m_oLayerService: LayerService
  ) {
  }

  ngOnInit(){
    if (this.m_oData) { 
      this.m_aoInputLayers = this.m_oData.selectedLayers;
      this.m_oAOI = this.m_oData.aoiBbox;
      this.m_sWKTAoi = this.latLngBoundsToWKT(this.m_oAOI);

      let oInput = new LayerAnalyzerInputViewModel();
      oInput.layerIds = this.m_aoInputLayers.map((layer) => layer.id);
      oInput.bbox = this.m_sWKTAoi;

      this.m_oLayerService.analyzer(oInput).subscribe({
        next: (oResponse) => {
          if (oResponse) {
            this.m_sTotAreaPixels = oResponse.totAreaPixels;
            this.m_sEstimatedArea = oResponse.estimatedArea;
            this.m_sPercentTotAreaAffectedPixels = oResponse.percentTotAreaAffectedPixels;
            this.m_sPercentAreaAffectedPixels = oResponse.percentAreaAffectedPixels;
            this.m_sAreaPixelAffected = oResponse.areaPixelAffected;
            console.log(oResponse);
          }        
        },
        error: (oError) => {
          // this.m_oNotificationService.openInfoDialog(
          //   'Could not retrieve the information about the plugins associated with this area of operations.',
          //   'danger',
          //   'Error'
          // );
        },  
      })
    } 
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

  onRefresh() {

  }

  onExport() {

  }
}