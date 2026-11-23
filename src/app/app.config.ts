import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter, withInMemoryScrolling} from '@angular/router';

import {routes} from './app.routes';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, provideHttpClient, withInterceptors,} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {provideTranslation} from './config/translate-loader.config';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import {SessionInjectorInterceptor} from './services/interceptors/session-injector.interceptor';
import {AuthErrorInterceptor} from './services/interceptors/auth-error.interceptor';
import {BrandingService} from './services/branding.service';


export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [BrandingService],
      useFactory: (oBranding: BrandingService) => () => oBranding.initialize(),
    },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // SessionInjector must run first so that AuthErrorInterceptor sees the x-session-token header
    provideHttpClient(withInterceptors([SessionInjectorInterceptor, AuthErrorInterceptor])),
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    importProvidersFrom(LeafletModule),
    importProvidersFrom(LeafletDrawModule),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),
    provideAnimationsAsync(),
  ],
};
