import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../../services/api/subscription.service';
import { SubscriptionViewModel } from '../../../../models/SubscriptionViewModel';
import { RiseButtonComponent } from '../../../../components/rise-button/rise-button.component';
import { RiseTextInputComponent } from '../../../../components/rise-text-input/rise-text-input.component';
import { RiseTextAreaInputComponent } from '../../../../components/rise-textarea-input/rise-text-area-input.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-editor',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent,
    RiseTextAreaInputComponent,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './subscription-editor.component.html',
  styleUrl: './subscription-editor.component.css',
})
export class SubscriptionEditorComponent implements OnInit {
  m_bIsEditing: boolean = false;
  m_sSubscriptionHeader: string = '';
  m_oSubscription: SubscriptionViewModel = {} as SubscriptionViewModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<SubscriptionEditorComponent>,
    private m_oSubscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    if (this.m_oData) {
      this.m_oSubscription = this.m_oData.subscription;
      this.m_sSubscriptionHeader = this.m_oData.subscription.name;
      this.m_bIsEditing = this.m_oData.isEditing;
    }
    if (this.m_oSubscription.id) {
      this.getSubscriptionVM(this.m_oSubscription.id);
    }
  }

  getSubscriptionTypes() {}

  getSubscriptionVM(sSubscriptionId: string) {
    this.m_oSubscriptionService.getSubscriptionById(sSubscriptionId).subscribe({
      next: (oResponse) => {
        if (oResponse) {
          console.log(oResponse)
          this.m_oSubscription = oResponse;
        }
      },
      error: (oError) => {},
    });
  }

  updateSubscription() {}

  onDismiss(bUpdated: boolean) {
    this.m_oDialogRef.close(bUpdated);
  }
}
