import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-banner',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './rise-banner.component.html',
  styleUrl: './rise-banner.component.css',
})
export class RiseBannerComponent {
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
}
