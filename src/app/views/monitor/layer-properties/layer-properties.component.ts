import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
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
import {NotificationsDialogsService} from "../../../services/notifications-dialogs.service";

@Component({
  selector: 'app-layer-properties',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    TranslateModule,
    DatePipe
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
    private m_oNotificationDialogService:NotificationsDialogsService
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
      this.m_oLayerProperties.createdDate = this.m_oData.createdDate ?? this.m_oData.createdDate
      this.m_oLayerProperties.inputData = this.m_oData.inputData ? this.m_oData.inputData : ""
      this.m_oLayerProperties.referenceDate = this.m_oData.referenceDate??this.m_oData.referenceDate;
      this.m_oLayerProperties.layerId =this.m_oData.layerId ? this.m_oData.layerId : ""

    }
  }


  copyToClipboard(text: string) {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
      // Optional: Show a toast notification or message
      this.m_oNotificationDialogService.openSnackBar(
        "Copied to Clipboard!",
        "Update",
        "success"
      )
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  }
}

export interface LayerProperties {
  dataSource?: string,
  resolution?: string,
  createdDate?: number,
  referenceDate?: number,
  inputData?: string,
  layerId?:string;
}
