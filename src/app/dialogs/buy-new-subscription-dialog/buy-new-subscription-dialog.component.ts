import { Component } from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-buy-new-subscription-dialog',
  standalone: true,
    imports: [
        RiseButtonComponent
    ],
  templateUrl: './buy-new-subscription-dialog.component.html',
  styleUrl: './buy-new-subscription-dialog.component.css'
})
export class BuyNewSubscriptionDialogComponent {
  constructor(private m_oDialogRef: MatDialogRef<BuyNewSubscriptionDialogComponent>) {
  }
  submit() {
    this.m_oDialogRef.close(true);
  }
  onDismiss() {
    this.m_oDialogRef.close(false);
  }
}
