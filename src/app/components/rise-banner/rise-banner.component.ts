import { Component, Input } from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NotificationsDialogsService} from "../../services/notifications-dialogs.service";

@Component({
  selector: 'rise-banner',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './rise-banner.component.html',
  styleUrl: './rise-banner.component.css',
})
export class RiseBannerComponent {


  constructor(
    private m_oTranslateService:TranslateService,
    private m_oNotificationService:NotificationsDialogsService
  ) {
  }

  /**
   * Banner header text
   */
  @Input() m_sHeaderKey: string = '';

  /**
   * Banner description key
   */
  @Input() m_sDescriptionKey: string = '';

  /**
   * Is there an ongoing situation?
   */
  @Input() m_bLiveSituation: boolean = false;

  /**
   * Icon string
   */
  @Input() m_sIcon?: string = '';

  showInfoDialog() {
    const sMsg = this.m_oTranslateService.instant('DASHBOARD.INFO');
    this.m_oNotificationService.openInfoDialog(sMsg, 'alert', '');
  }
}
