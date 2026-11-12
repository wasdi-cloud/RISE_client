import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {BRAND_CONFIG, BrandConfig} from '../config/brand.config';

@Injectable({providedIn: 'root'})
export class BrandingService {
  constructor(
    @Inject(DOCUMENT) private m_oDocument: Document,
    @Inject(BRAND_CONFIG) public readonly brand: BrandConfig,
  ) {}

  initialize(): void {
    this.m_oDocument.documentElement.setAttribute('data-brand', this.brand.id);
    this.m_oDocument.title = this.brand.name;
    const oFavicon = this.m_oDocument.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (oFavicon) {
      oFavicon.setAttribute('href', this.brand.favicon);
      oFavicon.setAttribute('type', this.brand.faviconType);
    }
  }
}
