import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-button',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './rise-button.component.html',
  styleUrl: './rise-button.component.css'
})
export class RiseButtonComponent {
  /**
   * The label that will appear on interior of the button
   */
  @Input() m_sLabel: string = "default";

  /**
  * The size of the button: small or large. Medium by default
  */
  @Input() m_sSize?: 'small' | 'medium' | 'large' = "medium";

  /**
   * What is the role of the button? (Colour)
   */
  @Input() m_sRole?: 'success' | 'danger' | 'warning' | 'default' = "default"

  /**
   * The Icon that will appear on the left side of the button
   */
  @Input() m_sIconLeft: string = "";

  /**
   * The Icon that will appear on the right side of the button
   */
  @Input() m_sIconRight: string = "";

  /**
   * Is the button disabled?
   */
  @Input() m_bDisabled?: boolean = false;

  /**
   * Is the button a link? 
   */
  @Input() m_bLink?: boolean = false;

  /**
   * Is the button rounded? 
   */
  @Input() m_bRounded?: boolean = false;

  /**
   * Is the button outlined instead of solid? 
   */
  @Input() m_bOutline?: boolean = false;

  /**
   * Is the button "muted" (i.e., "white")?
   */
  @Input() m_bMuted?: boolean = false;

  /**
   * Is the button Active? (i.e., clicked)
   */
  @Input() m_bActive?: boolean = false;
}
