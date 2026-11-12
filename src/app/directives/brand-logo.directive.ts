import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {BrandingService} from '../services/branding.service';

@Directive({
  selector: 'img[riseBrandLogo]',
  standalone: true,
})
export class BrandLogoDirective implements OnInit {
  @Input() riseBrandLogo: '' | 'default' | 'inverse' = 'default';

  constructor(
    private m_oElement: ElementRef<HTMLImageElement>,
    private m_oRenderer: Renderer2,
    private m_oBranding: BrandingService,
  ) {}

  ngOnInit(): void {
    if (this.m_oBranding.brand.id !== 'emergency') {
      return;
    }
    const sLogo = this.riseBrandLogo === 'inverse' ? 'emergency-logo-inverse.svg' : 'emergency-logo.svg';
    this.m_oRenderer.setAttribute(this.m_oElement.nativeElement, 'src', `assets/branding/${sLogo}`);
    this.m_oRenderer.setAttribute(this.m_oElement.nativeElement, 'alt', this.m_oBranding.brand.name);
  }
}
