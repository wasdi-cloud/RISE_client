import {Component, OnInit} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/api/auth.service";
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {SubscriptionService} from "../../services/api/subscription.service";

@Component({
  selector: 'app-subscription-buy-success',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseToolbarComponent
  ],
  templateUrl: './subscription-buy-success.component.html',
  styleUrl: './subscription-buy-success.component.css'
})
export class SubscriptionBuySuccessComponent implements OnInit {
  m_sCheckoutCode:string;
  m_bCanProceed:boolean=false;

  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oSubscriptionService: SubscriptionService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oRouter: Router,
  ) {

  }

  ngOnInit() {
    this.m_oActiveRoute.paramMap.subscribe((params) => {
      this.m_sCheckoutCode = params.get('CHECKOUT_SESSION_ID'); // Fetch from route params

      if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sCheckoutCode)) {
        this.m_oSubscriptionService.confirmSubscription(this.m_sCheckoutCode).subscribe(
          {
            next: (oResponse) => {
              this.m_bCanProceed = true;
            },
            error: (oError) => {

              this.m_bCanProceed = false;
              this.m_oNotificationService.openSnackBar(
                "Something went wrong",
                "Error",
                "danger"
              );
            }
          }
        );
      }
    });
  }


  navigateToDashboard() {
    this.m_oRouter.navigateByUrl('/dashboard')
  }
}
