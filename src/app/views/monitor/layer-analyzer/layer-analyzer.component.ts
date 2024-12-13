import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {RiseButtonComponent} from "../../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../../components/rise-text-input/rise-text-input.component";
import {RiseTextareaInputComponent} from "../../../components/rise-textarea-input/rise-textarea-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BuyNewSubscriptionComponent
} from "../../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component";
import FadeoutUtils from "../../../shared/utilities/FadeoutUtils";
import {RiseHistogramComponent} from "../../../components/rise-histogram/rise-histogram.component";

@Component({
  selector: 'app-layer-analyzer',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    TranslateModule,
    RiseHistogramComponent
  ],
  templateUrl: './layer-analyzer.component.html',
  styleUrl: './layer-analyzer.component.css'
})
export class LayerAnalyzerComponent implements OnInit{
  @Input() m_sOrganizationId: string = '';

  @Output() m_oEmitBack: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );
  m_oLayerProperties: LayerProperties = {};


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<BuyNewSubscriptionComponent>,
  ) {
  }

  ngOnInit(){
    this.initLayerProperties();

  }

  forceUpdateLayer() {
    //TODO
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  private initLayerProperties() {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData)) {
      this.m_oLayerProperties.dataSource = this.m_oData.source;
      this.m_oLayerProperties.resolution = this.m_oData.source;
      this.m_oLayerProperties.createdDate = this.m_oData.source;
      this.m_oLayerProperties.referenceDate = (new Date(this.m_oData.referenceDate)).toISOString();
      this.m_oLayerProperties.inputData = this.m_oData.source;

    }
  }


  onRefreshLayer() {

  }
}

export interface LayerProperties {
  dataSource?: string,
  resolution?: string,
  createdDate?: string,
  referenceDate?: string,
  inputData?: string,
}


