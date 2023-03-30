import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { UserComponent } from './header/user/user.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfabricComponentsModule } from '@profabric/angular-components';
import { defineCustomElements } from '@profabric/web-components/loader';
import { MainComponent } from './main/main.component';
import { MenuItemComponent } from './menu-item/menu-item.component';

defineCustomElements();

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProfabricComponentsModule,
  ],
  exports: [],
  declarations: [
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    UserComponent,
    MainComponent,
    MenuItemComponent,
  ],
  providers: [],
})
export class SharedModule {}
