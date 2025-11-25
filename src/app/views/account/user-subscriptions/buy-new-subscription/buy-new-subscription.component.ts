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
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
    this.m_oSubInput.name="Subscription - " + oDate.toDateString()
    this.getPaymentTypes();
    this.m_sOrganizationId = this.getOrganizationId();

    // Use forkJoin to wait for all API calls to complete
    forkJoin([
      this.getSubTypes(),
      this.getPlugins()
    ]).subscribe({
      next: () => {
        // This block executes ONLY after BOTH getSubTypes and getPlugins have completed successfully.
        console.log('All initial data has arrived!');

        // Now that we have all the data and defaults are set, we can compute the price.
        if (this.enableComputePrice()) {
          this.getComputedPrice();
        }
      },
      error: (err) => {
        // This will be called if any of the API calls in forkJoin fail.
        console.error('An error occurred during initialization:', err);
        this.m_oNotificationService.openInfoDialog('Failed to initialize subscription options.', 'danger');
      }
    });
  }

  getSubTypes() {
    // Return the observable stream
    return this.m_oSubscriptionService.getSubscriptionTypes().pipe(
      tap(oResponse => {
        // Perform side-effects inside tap
        this.m_aoSubTypes = oResponse;
        this.initSubTypeNames();
      }),
      catchError(oError => {
        console.error(oError);
        // Return an empty array or a default value to allow forkJoin to complete
        return of([]);
      })
    );
  }

  getPlugins() {
    // Return the observable stream
    return this.m_oPluginService.getPluginsList().pipe(
      tap(oResponse => {
        // Perform side-effects inside tap
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
      }),
      catchError(oError => {
        console.error(oError);
        // Return an empty array or a default value to allow forkJoin to complete
        return of([]);
      })
    );
  }

   initSubTypeNames() {
    this.m_aoSubTypes.sort((a, b) => a.allowedAreas - b.allowedAreas);
    this.m_asSubTypeNames = this.m_aoSubTypes.map(
      (oSubType) => oSubType.stringCode.slice(8) + ' Area'
    );

    for (let i = 0; i < this.m_aoSubTypes.length; i++) {
      let oSubscriptionType = this.m_aoSubTypes[i];
      if (oSubscriptionType.allowedAreas === 1) {
        this.m_sSelectedSubType = oSubscriptionType.stringCode.slice(8) + ' Area';
        this.m_oSelectedType = oSubscriptionType;
      }
    }
  }

  initPluginNames() {
    this.m_aoPluginNames = this.m_aoPluginTypes.map((oPlugin) => oPlugin.name);
    this.m_asSelectedPluginsDisplay = [...this.m_aoPluginNames];
    this.m_asSelectedPlugins = this.m_aoPluginTypes.map((oPlugin) => oPlugin.id);
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
    let sMessage = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_MSG");
    // let sTitle = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationService.openConfirmationDialog(
      sMessage,
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
    console.log(this.m_oSubInput);
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
            console.log(oResponse);
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
      { name: '1 Month', value: 'MONTH' },
    ];

    this.m_sSelectedPaymentTypeName = '1 Month';
    this.m_oSelectedPaymentType = this.m_aoPaymentTypes[1];

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
    let sSuccessContactTitle: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS_CONTACT_TITLE'
    );
    let sSuccessContactDescription: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.SUCCESS_CONTACT_DESCRIPTION'
    );

    let sError: string = this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.ERROR'
    );
    this.initSubscriptionInput();
    let sMessage = this.m_oTranslate.instant("SUBSCRIPTIONS.CONTACT_MSG");
    // let sTitle = this.m_oTranslate.instant("SUBSCRIPTIONS.STRIPE_TITLE");
    this.m_oNotificationService.openConfirmationDialog(
      sMessage,
      'alert'
    ).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.isCheckoutNow=true;
        this.m_oSubscriptionService.saveSubscription(this.m_oSubInput).subscribe({
          next: (oResponse) => {
            this.m_oNotificationService.openSnackBar(sSuccessContactTitle,sSuccessContactDescription,'success');
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
    let sMessage =this.m_oTranslateService.instant(
      'SUBSCRIPTIONS.WIRE_TRANSFER'
    );
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationService.openConfirmationDialog(
      sMessage,
      'alert'
    ).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.isCheckoutNow = true;
        //Here we will email wasdi admins telling them that user wants to do wire transfer
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
  //   const sMsg = `
  //   <strong>Area Type:</strong><br/>
  //   <ul>
  //     <li><strong>Emergency:</strong> Best suited for short-term, high-priority monitoring (e.g., natural disasters, ongoing incidents). Data is delivered quickly, but not stored for long.</li>
  //     <li><strong>Long-Term:</strong> Designed for continuous or periodic monitoring over time (e.g., environmental studies, infrastructure tracking). Data may arrive slower but is archived for future access.</li>
  //   </ul>
  //   <br/>
  //   <strong>Subscription Type:</strong><br/>
  //   <ul>
  //     <li><strong>1 Location:</strong> Monitor a single area of operations.</li>
  //     <li><strong>3 Location:</strong> Monitor up to 3 different areas of operations.</li>
  //     <li><strong>5 Locations:</strong> Monitor up to five different areas simultaneously.</li>
  //     <li><strong>10 Locations:</strong> Ideal for broader monitoring needs — track up to ten separate regions.</li>
  //   </ul>
  // `;

    const sMsg = this.m_oTranslateService.instant('SUBSCRIPTIONS.AREA_INFO_MESSAGE');

    this.m_oNotificationService.openInfoDialog(sMsg, 'alert', '');
  }

}
