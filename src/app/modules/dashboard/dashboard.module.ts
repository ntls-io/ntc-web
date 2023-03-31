import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgWizardConfig, NgWizardModule, THEME } from 'ng-wizard';
import { FileUploadModule } from 'ng2-file-upload';
import { CreatePoolComponent } from 'src/app/components/create-pool/create-pool.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { PoolsComponent } from './pools/pools.component';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default,
};

@NgModule({
  declarations: [HomeComponent, PoolsComponent, CreatePoolComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    NgWizardModule.forRoot(ngWizardConfig),
    FileUploadModule,
  ],
})
export class DashboardModule {}
