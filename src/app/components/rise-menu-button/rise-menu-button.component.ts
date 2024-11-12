import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-menu-button',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './rise-menu-button.component.html',
  styleUrl: './rise-menu-button.component.css',
})
export class RiseMenuButtonComponent {
  @Input() m_sLabel: string;

  @Input() m_sIcon: string;

  @Input() m_bSelected: boolean = false;
}
