import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgWizardConfig, NgWizardModule, THEME } from 'ng-wizard';
import { FileUploadModule } from 'ng2-file-upload';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { JoinPoolComponent } from 'src/app/components/join-pool/join-pool.component';
import { PoolWizardComponent } from 'src/app/components/pool-wizard/pool-wizard.component';
import { SchemaPreviewComponent } from 'src/app/components/schema-preview/schema-preview.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AnalysisComponent } from './analysis/analysis.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { MarketComponent } from './market/market.component';
import { PoolsComponent } from './pools/pools.component';
import { RedeemComponent } from 'src/app/components/redeem/redeem.component';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};

@NgModule({
  declarations: [
    HomeComponent,
    PoolsComponent,
    PoolWizardComponent,
    JoinPoolComponent,
    SchemaPreviewComponent,
    MarketComponent,
    RedeemComponent,
    AnalysisComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    SharedModule,
    NgWizardModule.forRoot(ngWizardConfig),
    FileUploadModule,
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot()
  ]
})
export class DashboardModule {}
