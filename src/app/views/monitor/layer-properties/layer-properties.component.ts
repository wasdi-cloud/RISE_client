import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {RiseButtonComponent} from "../../../components/rise-button/rise-button.component";
import {RiseDropdownComponent} from "../../../components/rise-dropdown/rise-dropdown.component";
import {RiseTextInputComponent} from "../../../components/rise-text-input/rise-text-input.component";
import {RiseTextareaInputComponent} from "../../../components/rise-textarea-input/rise-textarea-input.component";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  BuyNewSubscriptionComponent
} from "../../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component";
import FadeoutUtils from "../../../shared/utilities/FadeoutUtils";

@Component({
  selector: 'app-layer-properties',
  standalone: true,
  imports: [
    CurrencyPipe,
    RiseButtonComponent,
    RiseDropdownComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    TranslateModule
  ],
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.css'
})
export class LayerPropertiesComponent implements OnInit {
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

  ngOnInit() {
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
      this.m_oLayerProperties.dataSource = this.m_oData.source ? this.m_oData.source : "";
      this.m_oLayerProperties.resolution = this.m_oData.resolution ? this.m_oData.resolution : ""
      this.m_oLayerProperties.createdDate = this.m_oData.createdDate ? new Date(this.m_oData.createdDate).toDateString() : ""
      this.m_oLayerProperties.inputData = this.m_oData.inputData ? this.m_oData.inputData : ""
      this.m_oLayerProperties.referenceDate = this.m_oData.referenceDate ? (new Date(this.m_oData.referenceDate)).toDateString() : "";
      this.m_oLayerProperties.layerId =this.m_oData.layerId ? this.m_oData.layerId : ""

    }
  }


}

export interface LayerProperties {
  dataSource?: string,
  resolution?: string,
  createdDate?: string,
  referenceDate?: string,
  inputData?: string,
  layerId?:string;
}
