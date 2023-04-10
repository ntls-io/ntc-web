import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { ProfabricComponentsModule } from '@profabric/angular-components';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { uiReducer } from './store/ui/reducer';
import { SchemaPreviewComponent } from './components/schema-preview/schema-preview.component';

@NgModule({
  declarations: [AppComponent, SchemaPreviewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ProfabricComponentsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),

    StoreModule.forRoot({ ui: uiReducer }),
    SharedModule,
  ],
  providers: [Store],
  bootstrap: [AppComponent],
})
export class AppModule {}
