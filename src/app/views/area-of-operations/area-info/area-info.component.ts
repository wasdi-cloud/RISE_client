import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AreaViewModel } from '../../../models/AreaViewModel';
import { AreaService } from '../../../services/api/area.service';
import FadeoutUtils from '../../../shared/utilities/FadeoutUtils';
import { NotificationsDialogsService } from '../../../services/notifications-dialogs.service';
import { PluginService } from '../../../services/api/plugin.service';
import { RiseTextInputComponent } from '../../../components/rise-text-input/rise-text-input.component';
import { RiseDateInputComponent } from '../../../components/rise-date-input/rise-date-input.component';
import { RiseTextareaInputComponent } from '../../../components/rise-textarea-input/rise-textarea-input.component';
import { DatePipe } from '@angular/common';
import { PluginListViewModel } from '../../../models/PluginListViewModel';
import { RiseCheckboxComponent } from '../../../components/rise-checkbox/rise-checkbox.component';
import {RiseButtonComponent} from "../../../components/rise-button/rise-button.component";

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
  ],
  templateUrl: './area-info.component.html',
  styleUrl: './area-info.component.css',
})
export class AreaInfoComponent implements OnInit {
  m_sAreaId: string = '';
  m_oArea: AreaViewModel = {} as AreaViewModel;
  m_asPlugins: { label: string; value: string }[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<AreaInfoComponent>,
    private m_oAreaService: AreaService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService
  ) {}

  ngOnInit(): void {
    if (this.m_oData.area) {
      this.m_sAreaId = this.m_oData.area.id;
      this.getAreaInfo();
    }
    this.getPlugins();

    console.log(this.m_oArea);
  }

  getAreaInfo() {
    this.m_oAreaService.getAreaById(this.m_sAreaId).subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationService.openInfoDialog(
            'Could not get area information',
            'alert',
            'Error'
          );
          return;
        }

        this.m_oArea = oResponse;
        console.log(this.m_oArea);
      },
      error: (oError) => {},
    });
  }

  onSelectionChange(oEvent) {}

  getPlugins() {
    this.m_oPluginService.getPluginsList().subscribe({
      next: (aoResponse) => {
        for (const aoResponseElement of aoResponse) {
          if (
            aoResponseElement != '' &&
            aoResponseElement.name &&
            aoResponseElement.id
          ) {
            this.m_asPlugins.push({
              label: aoResponseElement.name,
              value: aoResponseElement.id,
            });
          }
        }
      },
      error: (oError) => {},
    });
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  SaveAreaOfOperation() {
    this.m_oAreaService.updateArea(this.m_oArea).subscribe({
      next:(oReponse)=>{
        this.onDismiss();
      },error:(oError)=>{
        console.error(oError)
      }
    })
  }
}
