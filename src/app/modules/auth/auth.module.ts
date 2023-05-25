import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WalletPreviewComponent } from 'src/app/components/wallet-preview/wallet-preview.component';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, WalletPreviewComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    QRCodeModule
  ]
})
export class AuthModule {}
