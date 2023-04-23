import {
  ENVIRONMENT_INITIALIZER,
  inject,
  NgModule,
  NgZone
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { akitaDevtools, DevtoolsOptions } from '@datorama/akita';
import { Store, StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { uiReducer } from './store/ui/reducer';

export function provideAkitaDevtools(options: Partial<DevtoolsOptions> = {}) {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory() {
      return () => {
        akitaDevtools(inject(NgZone), options);
      };
    }
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({ ui: uiReducer }),
    SharedModule
  ],
  providers: [
    Store,
    provideAkitaDevtools({
      name: 'NTC'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
