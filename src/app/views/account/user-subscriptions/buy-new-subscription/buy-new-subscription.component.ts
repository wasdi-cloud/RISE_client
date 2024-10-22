import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SubscriptionService } from '../../../../services/api/subscription.service';
import { SubscriptionTypeViewModel } from '../../../../models/SubscriptionTypeViewModel';
import { RiseDropdownComponent } from '../../../../components/rise-dropdown/rise-dropdown.component';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseTextAreaInputComponent } from '../../../../components/rise-textarea-input/rise-text-area-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PluginService } from '../../../../services/api/plugin.service';
import { PluginViewModel } from '../../../../models/PluginViewModel';
import { NotificationsDialogsService } from '../../../../services/notifications-dialogs.service';
import { SubscriptionViewModel } from '../../../../models/SubscriptionViewModel';
import { ConstantsService } from '../../../../services/constants.service';
import {PaymentType} from "../../../../models/PaymentType";

@Component({
  selector: 'buy-new-subscription',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextAreaInputComponent,
    RiseDropdownComponent,
  ],
  templateUrl: './buy-new-subscription.component.html',
  styleUrl: './buy-new-subscription.component.css',
})
export class BuyNewSubscriptionComponent implements OnInit {
  @Input() m_sOrganizationId: string = '';

  @Output() m_oEmitBack: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );
  m_oSubInput: SubscriptionViewModel = {} as SubscriptionViewModel;

  m_aoSubTypes: Array<SubscriptionTypeViewModel> = [];

  m_asSubTypeNames: Array<string> = [];

  m_oSelectedType: SubscriptionTypeViewModel = null;

  m_aoPluginTypes: Array<PluginViewModel> = [];

  m_aoPluginNames: Array<string> = [];

  m_asSelectedPlugins: Array<string> = [];


  m_iComputedPrice: number = 0;
  m_asPaymentTypeNames: {name:string,value:string}[]=[];
  m_asSelectedPaymentType: PaymentType;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oSubscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.getSubTypes();
    this.getPlugins();
    this.getPaymentTypes();
    this.m_sOrganizationId = this.m_oConstantsService.getOrganization().id;
  }

  getSubTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: (oResponse) => {
        this.m_aoSubTypes = oResponse;
        this.initSubTypeNames();
      },
      error: (oError) => {},
    });
  }

  getPlugins() {
    this.m_oPluginService.getPluginsList().subscribe({
      next: (oResponse) => {
        if (!oResponse) {
          this.m_oNotificationService.openInfoDialog(
            'Could not load plugins',
            'error',
            'Error'
          );
        } else {
          this.m_aoPluginTypes = oResponse;
          this.initPluginNames();
        }
      },
      error: (oError) => {},
    });
  }

  initSubTypeNames() {
    this.m_asSubTypeNames = this.m_aoSubTypes.map(
      (oSubType) => oSubType.stringCode.slice(8) + ' Location(s)'
    );
  }

  initPluginNames() {
    this.m_aoPluginNames = this.m_aoPluginTypes.map((oPlugin) => oPlugin.name);
  }

  handleSubTypeSelect(oEvent) {
    let sSelectedType = oEvent.value;
    this.m_aoSubTypes.forEach((oType) => {
      if (oType.stringCode.includes(sSelectedType.slice(0, -12))) {
        this.m_oSelectedType = oType;
      }
    });
  }

  handlePluginSelect(oEvent) {
    let asSelectedPlugins = oEvent.value;
    asSelectedPlugins.forEach((sPlugin) => {
      this.m_aoPluginTypes.forEach((oPlugin) => {
        if (oPlugin.name === sPlugin) {
          this.m_asSelectedPlugins.push(oPlugin.id);
        }
      });
    });
  }

  executePurchase() {
    this.initSubscriptionInput();

    this.m_oSubscriptionService.buySubscription(this.m_oSubInput).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
      },
      error: (oError) => {
        console.log(oError)
      },
    });
  }

  initSubscriptionInput() {
    this.m_oSubInput.type = this.m_oSelectedType.stringCode;
    this.m_oSubInput.plugins = this.m_asSelectedPlugins;
    this.m_oSubInput.price = this.m_iComputedPrice;
    this.m_oSubInput.organizationId = this.m_sOrganizationId;
    this.m_oSubInput.paymentType=this.m_asSelectedPaymentType;
  }

  getComputedPrice() {
    this.initSubscriptionInput();
    this.m_oSubscriptionService
      .getSubscriptionPrice(this.m_oSubInput)
      .subscribe({
        next: (oResponse) => {
          if (!oResponse) {
            this.m_oNotificationService.openInfoDialog(
              'Could not get the computed price for these inputs.',
              'error',
              'Error'
            );
            return;
          } else {
            this.m_iComputedPrice = oResponse.price;
          }
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(
            'Could not get the computed price for these inputs.',
            'error',
            'Error'
          );
        },
      });
  }

  openBuyNewSub(bInput: boolean) {
    this.m_oEmitBack.emit(bInput);
  }

  handlePaymentTypeSelect(paymentTypes: any) {
    this.m_asSelectedPaymentType=paymentTypes.value.value;
  }

  getPaymentTypes() {
    this.m_asPaymentTypeNames=[{name:"Year",value:"YEAR"},{name:"Month",value:"MONTH"}];

  }
}
