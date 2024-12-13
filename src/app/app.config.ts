import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {BrowserModule, provideClientHydration,} from '@angular/platform-browser';
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


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([SessionInjectorInterceptor])),
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
