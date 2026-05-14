import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {AreaViewModel} from '../../../models/AreaViewModel';
import {AreaService} from '../../../services/api/area.service';
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import {NotificationsDialogsService} from '../../../services/notifications-dialogs.service';
import {PluginService} from '../../../services/api/plugin.service';
import {RiseTextInputComponent} from '../../../components/rise-text-input/rise-text-input.component';
import {RiseDateInputComponent} from '../../../components/rise-date-input/rise-date-input.component';
import {RiseTextareaInputComponent} from '../../../components/rise-textarea-input/rise-textarea-input.component';
import {DatePipe, NgIf, CommonModule} from '@angular/common';
import {RiseCheckboxComponent} from '../../../components/rise-checkbox/rise-checkbox.component';
import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {RiseDropdownComponent} from "../../../components/rise-dropdown/rise-dropdown.component";
import {JsonEditorService} from "../../../services/json-editor.service";
import {MapAPIService} from "../../../services/api/map.service";
import {MapParametersService} from "../../../services/api/map-parameters.service";
import {Subject, takeUntil} from "rxjs";
import {MatSlideToggle, MatSlideToggleChange} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {SubscriptionService} from '../../../services/api/subscription.service';
import {SubscriptionViewModel} from '../../../models/SubscriptionViewModel';
import {SubscriptionTypeViewModel} from '../../../models/SubscriptionTypeViewModel';
import {ConstantsService} from '../../../services/constants.service';
import {BuyNewSubscriptionComponent} from '../../account/user-subscriptions/buy-new-subscription/buy-new-subscription.component';

@Component({
  selector: 'app-area-info',
  standalone: true,
  imports: [
    TranslateModule,
    RiseCheckboxComponent,
    RiseTextInputComponent,
    RiseDateInputComponent,
    RiseTextareaInputComponent,
    DatePipe,
    RiseButtonComponent,
    NgIf,
    RiseDropdownComponent,
    CommonModule,
    MatSlideToggle,
    FormsModule,
  ],
  templateUrl: './area-info.component.html',
  styleUrl: './area-info.component.css',
})
export class AreaInfoComponent implements OnInit,OnDestroy {

  private m_oDestroy$ = new Subject<void>();
  m_sJSONParam = '{}';
  @ViewChild('editor') m_oEditorRef!: ElementRef;
  m_aoSelectedPlugins = [];
  m_oSelectedPlugin: any;

  m_bIsUpdate:boolean = false;
  m_bIsAdd:boolean = false;

  m_aoPluginMaps = [];
  m_oSelectedMap: any;

  m_bIsAdvancedSettingsOn: boolean = false;

  /**
   * Flag to indicate this is a new area creation from dashboard
   */
  m_bIsNewAreaCreation: boolean = false;

  /**
   * Plugins selected for new area
   */
  m_asPluginsSelected: string[] = [];

  /**
   * Support archive flag for new area
   */
  m_bIsSupportArchiveArea: boolean = false;
  m_bSupportArchiveToggle: boolean = false;

  m_bShowFastCheckout: boolean = false;
  m_bFastCheckoutLoading: boolean = false;
  m_bFastCheckoutRunning: boolean = false;
  m_bSubscriptionCheckLoading: boolean = false;
  m_bHasValidSubscription: boolean = true;
  m_bRequiresFastCheckout: boolean = false;
  m_sFastCheckoutError: string = '';
  m_iFastCheckoutPrice: number = 0;
  m_oFastCheckoutInput: SubscriptionViewModel = {} as SubscriptionViewModel;

  /**
   * Error tracking for validation
   */
  m_sAreaNameError: string = '';
  m_bNameIsValid: boolean = true;
  m_sPluginsError: string = '';
  m_bPluginsAreValid: boolean = true;
  m_bValidationActive: boolean = false;

  m_sAreaId: string = '';
  m_sParamsId: string = '';
  m_sMapId: string = '';
  m_oArea: AreaViewModel = {} as AreaViewModel;
  m_aoPlugins: { label: string; value: string }[] = [];
  m_asIsPublic: { label: string; value: string }[] = [];
  m_asSelectedIsPublic: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<AreaInfoComponent>,
    private m_oAreaService: AreaService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oMapService: MapAPIService,
    private m_oTranslate: TranslateService,
    private m_oMapParamsService: MapParametersService,
    private m_oJsonEditorService: JsonEditorService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oHttp: HttpClient,
  ) {
  }

  ngOnInit(): void {
    let sPublic: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.IS_PUBLIC'
    );

    this.m_asIsPublic.push({
      label: sPublic,
      value: 'isPublic'
    });

    // Check if this is a new area creation from dashboard
    if (this.m_oData?.isNew) {
      this.m_bIsNewAreaCreation = true;
      // Initialize new area with data from dashboard
      this.m_oArea = {} as AreaViewModel;
      this.m_oArea.bbox = this.m_oData.bbox;
      this.m_oArea.markerCoordinates = this.m_oData.markerCoordinates;
      this.checkArchiveSupport();
      this.trySuggestNameFromInitialData();
      this.checkSubscriptionBeforeCreation();
    } else if (this.m_oData?.area) {
      // Edit mode: existing area
      this.m_bIsNewAreaCreation = false;
      this.m_sAreaId = this.m_oData.area.id;
      this.getAreaInfo();
    }

    this.getPlugins();
  }

  private checkSubscriptionBeforeCreation(): void {
    if (!this.m_bIsNewAreaCreation) {
      return;
    }

    this.m_bSubscriptionCheckLoading = true;
    this.m_oAreaService.canUserAddArea().pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse: { canAdd: boolean; archiveSupported?: boolean }) => {
        this.m_bSubscriptionCheckLoading = false;
        this.m_bHasValidSubscription = !!oResponse?.canAdd;

        if (!this.m_bHasValidSubscription) {
          this.m_bRequiresFastCheckout = true;
          this.tryOpenFastCheckoutIfReady();
        }
      },
      error: () => {
        // Backend contract: unauthorized/internal_server_error means user cannot add area.
        this.m_bSubscriptionCheckLoading = false;
        this.m_bHasValidSubscription = false;
        this.m_bRequiresFastCheckout = true;
        this.tryOpenFastCheckoutIfReady();
      },
    });
  }

  private tryOpenFastCheckoutIfReady(): void {
    if (!this.m_bRequiresFastCheckout || !this.m_bIsNewAreaCreation) {
      return;
    }

    if (this.m_aoPlugins.length < 1) {
      return;
    }

    this.m_bRequiresFastCheckout = false;
    this.openFastCheckout();
  }

  private trySuggestNameFromInitialData(): void {
    if (!this.m_bIsNewAreaCreation || !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oArea.name)) {
      return;
    }

    const oShapeCenter = this.m_oData?.shapeInfo?.center;
    if (oShapeCenter && typeof oShapeCenter.lat === 'number' && typeof oShapeCenter.lng === 'number') {
      this.suggestedName(oShapeCenter.lat, oShapeCenter.lng);
      return;
    }

    const oMarkerPoint = this.parsePointWkt(this.m_oArea.markerCoordinates || this.m_oData?.markerCoordinates);
    if (oMarkerPoint) {
      this.suggestedName(oMarkerPoint.lat, oMarkerPoint.lng);
    }
  }

  private parsePointWkt(sPoint: string): { lat: number; lng: number } | null {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sPoint)) {
      return null;
    }

    const oMatch = /^POINT\(([-\d.]+)\s+([-\d.]+)\)$/.exec(sPoint.trim());
    if (!oMatch) {
      return null;
    }

    const fLng = Number(oMatch[1]);
    const fLat = Number(oMatch[2]);
    if (Number.isNaN(fLat) || Number.isNaN(fLng)) {
      return null;
    }

    return { lat: fLat, lng: fLng };
  }

  private suggestedName(fLat: number, fLng: number): void {
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oArea.name)) {
      return;
    }

    const sFallback = this.getLatLonFallbackName(fLat, fLng);
    const sLanguage = this.m_oTranslate.currentLang || 'en';
    const sUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(fLat)}&lon=${encodeURIComponent(fLng)}&zoom=10&addressdetails=1&accept-language=${encodeURIComponent(sLanguage)}`;

    this.m_oHttp.get<any>(sUrl).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oArea.name)) {
          return;
        }

        const sReverseGeocodedName = this.buildNameFromAddress(oResponse?.address);
        this.m_oArea.name = sReverseGeocodedName || sFallback;
      },
      error: () => {
        if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oArea.name)) {
          this.m_oArea.name = sFallback;
        }
      }
    });
  }

  private buildNameFromAddress(oAddress: any): string {
    if (!oAddress) {
      return '';
    }

    const sLocality = oAddress.city || oAddress.town || oAddress.village || oAddress.municipality || oAddress.county || '';
    const sRegion = oAddress.state || '';
    const sCountry = oAddress.country || '';

    if (sRegion && sCountry) {
      return `${sRegion}, ${sCountry}`;
    }


    if (sLocality && sCountry) {
      return `${sLocality}, ${sCountry}`;
    }

    if (sCountry) {
      return `${sCountry}`;
    }

    return '';
  }

  private getLatLonFallbackName(fLat: number, fLng: number): string {
    return `Area - Lat ${fLat.toFixed(4)}, Lon ${fLng.toFixed(4)}`;
  }

  ngOnDestroy() {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

  setSelectedMap(oEvent: any) {
    //here we call the getParams

    this.m_sMapId = oEvent.value.id;
    this.getMapParams();
  }

  private getMapParams() {
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sAreaId)) {
      this.m_oMapParamsService.getParameters(this.m_sAreaId, this.m_sMapId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oResponse) => {
            this.m_sJSONParam = oResponse.payload
            this.checkJSON();
            //check if the params are already overloaded or no
            if (oResponse.id) {
              this.m_bIsUpdate = true;
              this.m_sParamsId = oResponse.id;
              this.m_bIsAdd = false
            } else {
              this.m_bIsUpdate = false;
              this.m_bIsAdd = true;
            }

          }
          ,
          error: (oError) => {
            console.error(oError);
          }
        }
      )
    }
  }

  setSelectedPlugin(oEvent: any) {
    this.m_sJSONParam='{}'
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
    this.m_oSelectedPlugin = oEvent.value;
    let sPluginId = oEvent.value.value;
    this.m_oMapService.byPluginId(sPluginId).subscribe(
      {
        next: (oResponse: any) => {
          //update the maps list
          console.log(oResponse)
          this.m_aoPluginMaps = oResponse;
        },
        error: (oError) => {
          console.error(oError)
        }
      }
    )
  }

  getAreaInfo() {
    let sError: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_GET_INFO'
    );
    this.m_oAreaService.getAreaById(this.m_sAreaId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationService.openInfoDialog(sError, 'alert', 'Error');
          return;
        }

        this.m_oArea = oResponse;

        if (this.m_oArea.publicArea) {
          this.m_asSelectedIsPublic.push('isPublic');
        }
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'alert', 'Error');
      },
    });
  }

  onSelectionChange(oEvent) {
  }

  getPlugins() {
    let sError: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_PLUGINS'
    );
    this.m_oPluginService.getPluginsList().pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (aoResponse) => {
        for (const aoResponseElement of aoResponse) {
          if (
            aoResponseElement != '' &&
            aoResponseElement.name &&
            aoResponseElement.id
          ) {
            this.m_aoPlugins.push({
              label: aoResponseElement.name,
              value: aoResponseElement.id
            });

          }
        }

        if (this.m_bIsNewAreaCreation && this.m_asPluginsSelected.length === 0) {
          const asAllPlugins = this.m_aoPlugins.map((oPlugin) => oPlugin.value);
          this.onPluginSelectionChange([...asAllPlugins]);
        }

        this.tryOpenFastCheckoutIfReady();
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      },
    });
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  /**
   * Check if the organization's subscription supports archive
   */
  private checkArchiveSupport(): void {
    this.m_oAreaService.canAreaSupportArchive().pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (bResponse) => {
        this.m_bIsSupportArchiveArea = bResponse;
      }
    });
  }

  /**
   * Handle archive support toggle change
   */
  onSwitchArchiveButton(oToggle: MatSlideToggleChange): void {
    this.m_bSupportArchiveToggle = oToggle.checked;
  }

  /**
   * Handle plugin selection change for new area
   */
  onPluginSelectionChange(selectedValues: any[]): void {
    this.m_asPluginsSelected = selectedValues;
    if (selectedValues.length > 0) {
      this.m_bPluginsAreValid = true;
      this.m_sPluginsError = '';
    }
  }

  /**
   * Validate area name for new creation
   */
  private validateAreaName(): boolean {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oArea.name) || this.m_oArea.name.length < 3) {
      this.m_sAreaNameError = 'Please enter a valid name of at least 3 characters.';
      this.m_bNameIsValid = false;
      return false;
    }
    this.m_sAreaNameError = '';
    this.m_bNameIsValid = true;
    return true;
  }

  /**
   * Validate plugins selection for new creation
   */
  private validatePlugins(): boolean {
    if (this.m_asPluginsSelected.length < 1) {
      this.m_bPluginsAreValid = false;
      this.m_sPluginsError = 'Please select at least one plugin.';
      return false;
    }
    this.m_bPluginsAreValid = true;
    this.m_sPluginsError = '';
    return true;
  }

  returnToEditPage() {
    //here we initialize the values
    // init json editor
    this.m_sJSONParam = '{}';
    //init selected Plugins and map
    this.m_oSelectedPlugin = null;
    this.m_oSelectedMap = null;

    //init flags
    this.m_bIsUpdate = false;
    this.m_bIsAdd = false;
    //return
    this.m_bIsAdvancedSettingsOn = false;
  }

  saveAdvancedSetting() {
    //check json
    try {
      let oParsedJson = JSON.parse(this.m_sJSONParam);
      if(this.m_bIsAdd){
        let oMapParamVM = {
          areaId: this.m_sAreaId,
          mapId: this.m_sMapId,
          payload: this.m_sJSONParam
        }
        this.m_oMapParamsService.addParameters(oMapParamVM).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oResponse: any) => {
            this.returnToEditPage()

          },
          error: (oError) => {
            console.error('request error:'+oError);


          }
        })
      }else if(this.m_bIsUpdate){
        let oMapParamVM = {
          id: this.m_sParamsId,
          payload: this.m_sJSONParam
        }
        this.m_oMapParamsService.updateParameters(oMapParamVM).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oResponse: any) => {
            this.returnToEditPage()

          },
          error: (oError) => {
            console.error('request error:'+oError);


          }
        })
      }
      //todo differ add or update


    } catch (oError) {
      console.error('catch error:'+oError);
    }


  }

  saveAreaOfOperation() {
    let sError: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_SAVE'
    );
    let sSuccess: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.SUCCESS_SAVE'
    );

    if (this.m_bIsNewAreaCreation) {
      if (this.m_bSubscriptionCheckLoading) {
        return;
      }

      if (!this.m_bHasValidSubscription) {
        this.m_bRequiresFastCheckout = true;
        this.tryOpenFastCheckoutIfReady();
        return;
      }

      // Validate new area creation
      this.m_bValidationActive = true;
      if (!this.validateAreaName() || !this.validatePlugins()) {
        return;
      }

      this.m_oArea.publicArea = this.m_asSelectedIsPublic.length > 0;
      this.m_oArea.plugins = this.m_asPluginsSelected;
      this.m_oArea.supportArchive = this.m_bSupportArchiveToggle;

      // Use addArea for new creation
      this.m_oAreaService.addArea(this.m_oArea).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          this.m_oNotificationService.openSnackBar(sSuccess, 'Success', 'success');
          this.m_oDialogRef.close(true);
        },
        error: (oError) => {
          if (oError.error?.errorStringCodes?.[0] === 'ERROR_API_NO_VALID_SUBSCRIPTION') {
            this.m_bHasValidSubscription = false;
            this.m_bRequiresFastCheckout = true;
            this.tryOpenFastCheckoutIfReady();
          } else {
            this.m_oNotificationService.openInfoDialog(sError, 'danger');
          }
        },
      });
    } 
    else {
      // Update existing area
      if (this.m_asSelectedIsPublic.length > 0) {
        this.m_oArea.publicArea = true;
      } else {
        this.m_oArea.publicArea = false;
      }

      this.m_oAreaService.updateArea(this.m_oArea).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          this.m_oNotificationService.openSnackBar(sSuccess, 'Success', 'success');
          this.m_oDialogRef.close(true);
        },
        error: (oError) => {
          this.m_oNotificationService.openInfoDialog(sError, 'danger');
        },
      });
    }
  }

  openFastCheckout(): void {
    this.m_bShowFastCheckout = true;
    this.m_sFastCheckoutError = '';
    this.m_iFastCheckoutPrice = 0;
    this.m_bFastCheckoutLoading = true;

    const sOrganizationId = this.m_oConstantsService.getUser()?.organizationId;
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sOrganizationId)) {
      this.m_bFastCheckoutLoading = false;
      this.m_sFastCheckoutError = this.m_oTranslate.instant('SUBSCRIPTIONS.ERROR');
      return;
    }

    this.m_oSubscriptionService.getSubscriptionTypes().pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (aoTypes: SubscriptionTypeViewModel[]) => {
        if (!aoTypes || aoTypes.length < 1 || this.m_aoPlugins.length < 1) {
          this.m_bFastCheckoutLoading = false;
          this.m_sFastCheckoutError = this.m_oTranslate.instant('SUBSCRIPTIONS.TYPE_ERROR');
          return;
        }

        const oOneAreaType = [...aoTypes].sort((oA, oB) => oA.allowedAreas - oB.allowedAreas)[0];

        const oFastInput = {} as SubscriptionViewModel;
        oFastInput.name = 'Subscription - ' + new Date().toDateString();
        oFastInput.organizationId = sOrganizationId;
        oFastInput.type = oOneAreaType.stringCode;
        oFastInput.paymentType = 'MONTH' as any;
        oFastInput.paymentMethod = 'credit';
        oFastInput.plugins = this.m_aoPlugins.map((oPlugin) => oPlugin.value);
        oFastInput.supportsArchive = false;

        this.m_oFastCheckoutInput = oFastInput;

        this.m_oSubscriptionService.getSubscriptionPrice(oFastInput).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oPriceResponse) => {
            this.m_iFastCheckoutPrice = oPriceResponse?.price || 0;
            this.m_bFastCheckoutLoading = false;
            if (!this.m_iFastCheckoutPrice) {
              this.m_sFastCheckoutError = this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR');
            }
          },
          error: () => {
            this.m_bFastCheckoutLoading = false;
            this.m_sFastCheckoutError = this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR');
          },
        });
      },
      error: () => {
        this.m_bFastCheckoutLoading = false;
        this.m_sFastCheckoutError = this.m_oTranslate.instant('SUBSCRIPTIONS.TYPE_ERROR');
      },
    });
  }

  executeFastCheckout(): void {
    if (this.m_bFastCheckoutRunning || !this.m_oFastCheckoutInput?.type || !this.m_oFastCheckoutInput?.organizationId) {
      return;
    }

    this.m_oArea.publicArea = this.m_asSelectedIsPublic.length > 0;
    this.m_oArea.plugins = this.m_asPluginsSelected;
    this.m_oArea.supportArchive = this.m_bSupportArchiveToggle;
    this.m_oArea.active = false;

    // Use addArea for new creation with a de-activated area
    this.m_oAreaService.addArea(this.m_oArea).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        if (this.m_oArea.name != null) {
          this.m_oFastCheckoutInput.name = this.m_oArea.name;
        }
        
        this.m_oFastCheckoutInput.associatedAreaId = oResponse.id;

        this.m_bFastCheckoutRunning = true;
        this.m_oSubscriptionService.saveSubscription(this.m_oFastCheckoutInput).pipe(takeUntil(this.m_oDestroy$)).subscribe({
          next: (oResponse) => {
            const sSubId = oResponse?.body?.id;
            if (FadeoutUtils.utilsIsStrNullOrEmpty(sSubId)) {
              this.m_bFastCheckoutRunning = false;
              this.m_oNotificationService.openInfoDialog(this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR'), 'danger');
              return;
            }

            this.m_oSubscriptionService.getStripePaymentUrl(sSubId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
              next: (sUrl) => {
                this.m_bFastCheckoutRunning = false;
                if (!FadeoutUtils.utilsIsStrNullOrEmpty(sUrl)) {
                  window.location.href = sUrl;
                  return;
                }
                this.m_oNotificationService.openInfoDialog(this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR'), 'danger');
              },
              error: () => {
                this.m_bFastCheckoutRunning = false;
                this.m_oNotificationService.openInfoDialog(this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR'), 'danger');
              },
            });
          },
          error: () => {
            this.m_bFastCheckoutRunning = false;
            this.m_oNotificationService.openInfoDialog(this.m_oTranslate.instant('SUBSCRIPTIONS.PURCHASE_ERROR'), 'danger');
          },
        });

      },
      error: (oError) => {
        if (oError.error?.errorStringCodes?.[0] === 'ERROR_API_NO_VALID_SUBSCRIPTION') {
          this.m_bHasValidSubscription = false;
          this.m_bRequiresFastCheckout = true;
          this.tryOpenFastCheckoutIfReady();
        } else {
          this.m_oNotificationService.openInfoDialog(sError, 'danger');
        }
      },
    });

    if (this.m_oArea != null) {
      if (this.m_oArea.name != null) {
        
      }
    }
  }

  openFullBuyOptions(): void {
    this.m_oDialog.open(BuyNewSubscriptionComponent, {
      data: {
        organizationId: this.m_oConstantsService.getUser()?.organizationId,
        prefill: {
          name: this.m_oArea?.name || '',
          description: this.m_oArea?.description || '',
          pluginIds: this.m_asPluginsSelected?.length ? [...this.m_asPluginsSelected] : this.m_aoPlugins.map((oPlugin) => oPlugin.value),
          bbox: this.m_oArea?.bbox || this.m_oData?.bbox || '',
          markerCoordinates: this.m_oArea?.markerCoordinates || this.m_oData?.markerCoordinates || '',
        },
      },
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '90vw',
      height: '80vh',
      disableClose: true,
      panelClass: 'full-screen-dialog',
    }).afterClosed().subscribe(() => {
      if (this.m_bIsNewAreaCreation) {
        this.checkSubscriptionBeforeCreation();
      }
    });
  }


  openAdvancedSettingsDialog() {

    this.m_aoSelectedPlugins = this.m_aoPlugins
    // Use a setTimeout to wait for the view to update
    setTimeout(() => {
      this.showJsonParams();
    }, 0);


    this.m_bIsAdvancedSettingsOn = true;


  }

  showJsonParams() {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor()
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
  }

  getJsonInput() {
    this.m_sJSONParam = this.m_oJsonEditorService.getValue();

    try {
      // let parsedJson = JSON.parse(this.m_sJSONParam);
      // if (parsedJson.northEast && parsedJson.southWest) {
      //   this.m_oBBox.north = parsedJson.northEast.lat
      //   this.m_oBBox.east = parsedJson.northEast.lng
      //   this.m_oBBox.south = parsedJson.southWest.lat
      //   this.m_oBBox.west = parsedJson.southWest.lng
      // }
    } catch (error) {
      console.error(error)
    }
  }

  checkJSON() {
    let sErrorMsg = this.m_oTranslate.instant("MANUAL_BBOX.DIALOG_FORMAT_JSON_ERROR");
    let sErrorHeader = this.m_oTranslate.instant("LAT_LNG_SEARCH.ERROR");
    try {
      let oParsedJson = JSON.parse(this.m_sJSONParam);
      let sPrettyPrint = JSON.stringify(oParsedJson, null, 2);

      this.m_oJsonEditorService.setText(sPrettyPrint)

    } catch {
      this.m_oNotificationService.openInfoDialog(sErrorMsg, 'danger', sErrorHeader)
    }
  }

  deleteParamAndReturnTheDefaultOne(){
    // the idea here is to delete the params entered by the user either saved or not and then get the default one.
    //   we need to ensure this is not doable until the user selects a plugin and map id
    if(!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sAreaId) && !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sMapId)){
      if(this.m_bIsUpdate){
        //here the user has already saved his own params and now wants to get the default one so we delete his params and  get the default one
        // safe programming
        if(!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sParamsId)){
          this.m_oMapParamsService.deleteParameters(this.m_sParamsId).pipe(takeUntil(this.m_oDestroy$)).subscribe({
            next: (oResponse) => {
              //now we call the default param
              this.getMapParams();
            },
            error: (oError) => {
              console.error('request error:'+oError);
            }
          })
        }
      }else{
        //here either the user did not yet saved the map params (cleared the old params, modified and want to undo his changes …ect)
        this.getMapParams();
      }
    }

  }
}
