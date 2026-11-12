import {Directive, ElementRef, Input, OnChanges, Renderer2} from '@angular/core';
import {BrandingService} from '../services/branding.service';

@Directive({
  selector: 'img[riseBrandLogo]',
  standalone: true,
})
export class BrandLogoDirective implements OnChanges {
  @Input() riseBrandLogo: '' | 'default' | 'inverse' | 'mini' = 'default';

  constructor(
    private m_oElement: ElementRef<HTMLImageElement>,
    private m_oRenderer: Renderer2,
    private m_oBranding: BrandingService,
  ) {}

  ngOnChanges(): void {
    if (this.m_oBranding.brand.id !== 'emergency') {
      return;
    }
    const sLogo = this.riseBrandLogo === 'mini' ? 'emergency-logo-mini.png' : 'emergency-logo-cropped.png';
    this.m_oRenderer.setAttribute(this.m_oElement.nativeElement, 'src', `assets/rise-assets/${sLogo}`);
    this.m_oRenderer.setAttribute(this.m_oElement.nativeElement, 'alt', this.m_oBranding.brand.name);
  }
}
