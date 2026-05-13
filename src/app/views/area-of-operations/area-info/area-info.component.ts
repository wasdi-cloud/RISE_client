import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
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
    private m_oJsonEditorService: JsonEditorService
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
    } else if (this.m_oData?.area) {
      // Edit mode: existing area
      this.m_bIsNewAreaCreation = false;
      this.m_sAreaId = this.m_oData.area.id;
      this.getAreaInfo();
    }

    this.getPlugins();
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
            this.m_oNotificationService.openConfirmationDialog(
              'Your subscription is invalid. Would you like to purchase a new one?',
              'alert'
            );
          } else {
            this.m_oNotificationService.openInfoDialog(sError, 'danger');
          }
        },
      });
    } else {
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
    let sErrorHeader = this.m_oTranslate.instant("MANUAL_BBOX.KEY_PHRASES.ERROR");
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
