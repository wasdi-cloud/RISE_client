import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rise-affected-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './rise-affected-widget.component.html',
  styleUrl: './rise-affected-widget.component.css'
})
export class RiseAffectedWidgetComponent {
  m_bShowContent: boolean = true
  @Input() m_iAffectedPpl: number = null;

  collapseWidget() {
    this.m_bShowContent = !this.m_bShowContent;
  }
}
