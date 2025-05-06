import {Component, EventEmitter, Inject, Input, OnInit, Output,} from '@angular/core';
import {SubscriptionService} from '../../../../services/api/subscription.service';
import {SubscriptionTypeViewModel} from '../../../../models/SubscriptionTypeViewModel';
import {RiseDropdownComponent} from '../../../../components/rise-dropdown/rise-dropdown.component';
import {RiseButtonComponent} from '../../../../components/rise-button/rise-button.component';
import {RiseTextInputComponent} from '../../../../components/rise-text-input/rise-text-input.component';
import {RiseTextareaInputComponent} from '../../../../components/rise-textarea-input/rise-textarea-input.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {PluginService} from '../../../../services/api/plugin.service';
import {PluginViewModel} from '../../../../models/PluginViewModel';
import {NotificationsDialogsService} from '../../../../services/notifications-dialogs.service';
import {SubscriptionViewModel} from '../../../../models/SubscriptionViewModel';
import {ConstantsService} from '../../../../services/constants.service';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../../services/api/user.service';
import {FormsModule} from "@angular/forms";
import FadeoutUtils from "../../../../shared/utilities/FadeoutUtils";

@Component({
  selector: 'buy-new-subscription',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextareaInputComponent,
    RiseDropdownComponent,
    FormsModule,
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

  m_sSelectedSubType:string=""

  m_oSelectedType: SubscriptionTypeViewModel = null;

  m_aoPluginTypes: Array<PluginViewModel> = [];

  m_aoPluginNames: Array<string> = [];

  m_asSelectedPlugins: Array<string> = [];

  m_asSelectedPluginsDisplay: Array<string> = [];

  m_iComputedPrice: number = 0;

  m_aoPaymentTypes: Array<{ name: string; value: string }> = [];

  m_asPaymentTypeNames: Array<string> = [];

  m_sPaymentMethod:string='credit';
  m_oSelectedPaymentType = null;
  m_sSelectedPaymentTypeName:string = "";
  isCheckoutNow: boolean = false;
  m_iStep: number = 1; // Step 1 initially

  goToNextStep() {
    this.m_iStep = 2;
  }

  goToPreviousStep() {
    this.m_iStep = 1;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<BuyNewSubscriptionComponent>,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oTranslate: TranslateService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslateService: TranslateService,
  ) {}

  ngOnInit(): void {
    let oDate=new Date()
    this.m_oSubInput.name="Subscription - "+oDate.toDateString()
    this.getSubTypes();
    this.getPlugins();
    this.getPaymentTypes();
    this.m_sOrganizationId = this.getOrganizationId();
  }

  getSubTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: (oResponse) => {
        this.m_aoSubTypes = oResponse;
        this.initSubTypeNames();
      },
      error: (oError) => {
        console.error(oError);
      },
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
      error: (oError) => {
        console.error(oError);
      },
    });
  }

  initSubTypeNames() {
    console.log(this.m_aoSubTypes)
    this.m_aoSubTypes.sort((a, b) => a.allowedAreas - b.allowedAreas);
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
        this.m_sSelectedSubType=sSelectedType;
      }
    });

    if(this.enableComputePrice()){
      this.getComputedPrice();
    }
  }

  handlePluginSelect(oEvent) {
    let asSelectedPlugins = oEvent.value;
    this.m_asSelectedPluginsDisplay = asSelectedPlugins;

    asSelectedPlugins.forEach((sPlugin) => {
      this.m_aoPluginTypes.forEach((oPlugin) => {
        if (oPlugin.name === sPlugin && !this.m_asSelectedPlugins.includes(oPlugin.id)) {
          this.m_asSelectedPlugins.push(oPlugin.id);
        }
      });
    });

    this.m_oSubInput.plugins = this.m_asSelectedPlugins;

  }


  executePurchaseWithCreditCard() {
    let sSuccess: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS'
    );

    let sError: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.ERROR'
    );
    this.initSubscriptionInput();
    // let sMessage = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_MSG");
    // let sTitle = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationService.openConfirmationDialog(
      "You will be re-directed to our payment partner, Stripe. Click 'Confirm' to continue or 'CANCEL' to end the payment process.",
      'alert'
    ).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.isCheckoutNow=true;

        this.m_oSubscriptionService.saveSubscription(this.m_oSubInput).subscribe({
          next: (oResponse) => {
            this.getStripePaymentUrl(oResponse.body.id);
          },
          error: (oError) => {
            this.isCheckoutNow=false;
            this.m_oNotificationService.openInfoDialog(sError, 'danger');
          },
        });
        // if (!this.m_oEditSubscription.subscriptionId) {
        //   this.m_bCheckoutNow = true;
        //   this.saveSubscription();
        // } else {
        //   this.getStripePaymentUrl();
        // }
      }
    })

  }

  getStripePaymentUrl(subscriptionId: string) {
    this.m_oSubscriptionService.getStripePaymentUrl(subscriptionId).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          // this.m_oNotificationService.openSnackBar(this.m_oTranslate.instant("USER_SUBSCRIPTION_URL"), '', 'success-snackbar');
          let sUrl = oResponse;
          window.location.href = sUrl;
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openSnackBar(this.m_oTranslate.instant("USER_SUBSCRIPTION_URL_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'alert');
        this.isCheckoutNow=false;
      }
    });
  }
  initSubscriptionInput() {
    this.m_oSubInput.type = this.m_oSelectedType.stringCode;
    this.m_oSubInput.plugins = this.m_asSelectedPlugins;
    this.m_oSubInput.price = this.m_iComputedPrice;
    this.m_oSubInput.organizationId = this.m_sOrganizationId;
    this.m_oSubInput.paymentType = this.m_oSelectedPaymentType.value;
    this.m_oSubInput.paymentMethod = this.m_sPaymentMethod;
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
          console.error(oError);
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

  handlePaymentTypeSelect(oPaymentType: any) {
    let sTypeName = oPaymentType.value;
    console.log(oPaymentType.value);
    this.m_sSelectedPaymentTypeName=oPaymentType.value

    this.m_oSelectedPaymentType = this.m_aoPaymentTypes.find(
      (oType) => oType.name === sTypeName
    );
    if(this.enableComputePrice()){
      this.getComputedPrice();
    }

  }

  getPaymentTypes() {
    this.m_aoPaymentTypes = [
      { name: 'Year', value: 'YEAR' },
      { name: '3 Months', value: 'MONTH' },
    ];

    this.m_asPaymentTypeNames = this.m_aoPaymentTypes.map(
      (oType) => oType.name
    );
  }

  enablePurchaseBtn(): boolean {
    if (this.isCheckoutNow) {
      return false;
    }
    if (!this.m_oSubInput.name) {
      return false;
    }
    if (
      !this.m_oSelectedType ||
      !this.m_asSelectedPlugins ||
      !this.m_oSelectedPaymentType||
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sPaymentMethod)
    ) {
      return false;
    }

    if (!this.m_iComputedPrice) {
      return false;
    }

    return true;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  private getOrganizationId() {
    let sOrganizationId: string = '';
    if (this.m_oData?.organizationId) {
      sOrganizationId = this.m_oData.organizationId;
    } else {
      sOrganizationId = this.m_oConstantsService.getUser()?.organizationId;
    }
    return sOrganizationId;
  }

  enableNextBtn() {
    if (!this.m_oSubInput.name) {
      return false;
    }
    if (
      !this.m_oSelectedType ||
      !this.m_asSelectedPlugins ||
      this.m_asSelectedPlugins.length == 0
    ) {
      return false;
    }


    return true;
  }

  enableComputePrice() {
    if (!this.m_oSelectedType.stringCode) {

      return false;
    }
    if (!this.m_asSelectedPlugins || this.m_asSelectedPlugins.length == 0) {

      return false;
    }
    if (!this.m_sOrganizationId) {

      return false;
    }
    if (!this.m_oSelectedPaymentType?.value) {

      return false;
    }
    return true;
  }

  executePurchaseWithContactUs() {
    let sSuccess: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS'
    );

    let sError: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.ERROR'
    );
    this.initSubscriptionInput();
    // let sMessage = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_MSG");
    // let sTitle = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationService.openConfirmationDialog(
      "The team of RISE will contact you to handle the payment. Click 'Confirm' to continue or 'CANCEL' to end the payment process.",
      'alert'
    ).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.isCheckoutNow=true;
        this.m_oSubscriptionService.saveSubscription(this.m_oSubInput).subscribe({
          next: (oResponse) => {
            this.m_oNotificationService.openSnackBar("Subscription is created successfully","Subscription created",'success');
            this.onDismiss();
            this.isCheckoutNow = false;
          },
          error: (oError) => {
            this.isCheckoutNow=false;
            this.m_oNotificationService.openInfoDialog(sError, 'danger');
          },
        });
        // if (!this.m_oEditSubscription.subscriptionId) {
        //   this.m_bCheckoutNow = true;
        //   this.saveSubscription();
        // } else {
        //   this.getStripePaymentUrl();
        // }
      }
    })
  }

  executePurchaseWithWire() {
    let sSuccess: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS'
    );

    let sError: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.ERROR'
    );
    this.initSubscriptionInput();
    // let sMessage = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_MSG");
    // let sTitle = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_TITLE");
    let sMessage = `
  <p>
    These are the bank coordinates for RISE and the exact amount to pay: <strong>${this.m_oSubInput.price} €</strong>.
    Your subscription will be activated once the wire transfer is received.
  </p>
  <p><strong>Bank Details:</strong></p>
  <ul>
    <li><strong>Bank Name:</strong> Dummy Bank</li>
    <li><strong>Account Number:</strong> 1234 5678 9012</li>
    <li><strong>IBAN:</strong> XX00 1234 5678 9012 3456 7890</li>
    <li><strong>SWIFT/BIC:</strong> DUMMYBANKXX</li>
  </ul>
  <p><strong>Reference Code:</strong> WIRE-123456789</p>
  <p>Click 'Confirm' to continue or 'CANCEL' to end the payment process.</p>
`;
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationService.openConfirmationDialog(
      sMessage,
      'alert'
    ).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.isCheckoutNow = true;
        this.m_oSubscriptionService.saveSubscription(this.m_oSubInput).subscribe({
          next: (oResponse) => {
            this.m_oNotificationService.openSnackBar("Subscription is created successfully", "Subscription created", 'success');
            this.onDismiss();
            this.isCheckoutNow = false;
          },
          error: (oError) => {
            this.isCheckoutNow = false;
            this.m_oNotificationService.openInfoDialog(sError, 'danger');
          },
        });
        // if (!this.m_oEditSubscription.subscriptionId) {
        //   this.m_bCheckoutNow = true;
        //   this.saveSubscription();
        // } else {
        //   this.getStripePaymentUrl();
        // }
      }
    })
  }

  openInfoDialog() {
    const sMsg = `
    <strong>Area Type:</strong><br/>
    <ul>
      <li><strong>Emergency:</strong> Best suited for short-term, high-priority monitoring (e.g., natural disasters, ongoing incidents). Data is delivered quickly, but not stored for long.</li>
      <li><strong>Long-Term:</strong> Designed for continuous or periodic monitoring over time (e.g., environmental studies, infrastructure tracking). Data may arrive slower but is archived for future access.</li>
    </ul>
    <br/>
    <strong>Subscription Type:</strong><br/>
    <ul>
      <li><strong>1 Location:</strong> Monitor a single area of operations.</li>
      <li><strong>3 Location:</strong> Monitor up to 3 different areas of operations.</li>
      <li><strong>5 Locations:</strong> Monitor up to five different areas simultaneously.</li>
      <li><strong>10 Locations:</strong> Ideal for broader monitoring needs — track up to ten separate regions.</li>
    </ul>
  `;
    this.m_oNotificationService.openInfoDialog(sMsg, 'alert', '');
  }

}
