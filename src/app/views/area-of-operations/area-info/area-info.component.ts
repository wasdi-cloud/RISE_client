import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
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
import {DatePipe, NgIf} from '@angular/common';
import {RiseCheckboxComponent} from '../../../components/rise-checkbox/rise-checkbox.component';
import {RiseButtonComponent} from '../../../components/rise-button/rise-button.component';
import {RiseDropdownComponent} from "../../../components/rise-dropdown/rise-dropdown.component";
import {JsonEditorService} from "../../../services/json-editor.service";
import {MapAPIService} from "../../../services/api/map.service";

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
  ],
  templateUrl: './area-info.component.html',
  styleUrl: './area-info.component.css',
})
export class AreaInfoComponent implements OnInit {
  m_sJSONParam = '{}';
  @ViewChild('editor') m_oEditorRef!: ElementRef;
  m_aoSelectedPlugins = [];
  m_oSelectedPlugin :any;

  m_aoPluginMaps = [];
  m_oSelectedMap :any;


  m_bIsAdvancedSettingsOn: boolean = false;


  m_sAreaId: string = '';
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

    if (this.m_oData.area) {
      this.m_sAreaId = this.m_oData.area.id;
      this.getAreaInfo();
    }

    this.getPlugins();
  }
  setSelectedMap(oEvent: any) {
      //here we call the getParams
  }

  setSelectedPlugin(oEvent: any) {
    this.m_oSelectedPlugin = oEvent.value;
    let sPluginId = oEvent.value.value;
    this.m_oMapService.byPluginId(sPluginId).subscribe(
      {
        next: (oResponse: any) => {
          //update the maps list
          console.log(oResponse)
          this.m_aoPluginMaps=oResponse;
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
    this.m_oAreaService.getAreaById(this.m_sAreaId).subscribe({
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
    this.m_oPluginService.getPluginsList().subscribe({
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

  returnToEditPage() {
    //here we initialize the values
    this.m_bIsAdvancedSettingsOn = false;
  }

  saveAdvancedSetting() {
    //here we initialize the values
    //save
    //return
    this.returnToEditPage()
  }

  saveAreaOfOperation() {
    let sError: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_SAVE'
    );
    let sSuccess: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.SUCCESS_SAVE'
    );

    if (this.m_asSelectedIsPublic.length > 0) {
      this.m_oArea.publicArea = true;
    } else {
      this.m_oArea.publicArea = false;
    }

    this.m_oAreaService.updateArea(this.m_oArea).subscribe({
      next: (oResponse) => {
        this.m_oNotificationService.openSnackBar(
          sSuccess,
          'Success',
          'success'
        );
        this.onDismiss();
      },
      error: (oError) => {
        this.m_oNotificationService.openInfoDialog(sError, 'danger');
      },
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
}
