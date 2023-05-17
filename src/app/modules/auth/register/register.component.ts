import { Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WalletPreviewComponent } from 'src/app/components/wallet-preview/wallet-preview.component';
import { SessionService } from 'src/app/states/session';
import Validation from 'src/app/utils/validation';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @HostBinding('class') class = 'vh-100 d-flex align-items-center';
  registerForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required, Validators.email]),
      auth_password: new FormControl('', Validators.required),
      confirm_auth_password: new FormControl('', Validators.required)
    },
    {
      validators: [Validation.match('auth_password', 'confirm_auth_password')]
    }
  );
  isBusy = false;
  constructor(
    private sessionService: SessionService,
    private modalService: BsModalService
  ) {}

  get f() {
    return this.registerForm.controls;
  }

  async registerByAuth() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isBusy = true;
      const { username, auth_password } = this.registerForm.value;

      await this.sessionService
        .register(username!, auth_password!)
        .then(result => {
          if (result?.vault_id) {
            this.showWalletModal(result?.algorand_address_base32);
          }
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            titleText: 'Account not Created!',
            text: error,
            confirmButtonText: 'DONE'
          });
        })
        .finally(() => {
          this.isBusy = false;
        });
    }
  }

  async showWalletModal(address: string) {
    const modalRef: BsModalRef = this.modalService.show(
      WalletPreviewComponent,
      {
        initialState: {
          address
        },
        class: 'modal-dialog-centered'
      }
    );

    if (modalRef?.onHide) {
      modalRef.onHide
        .pipe(untilDestroyed(this))
        .subscribe((reason: string | any) => {
          if (typeof reason !== 'string') {
            reason ? this.login() : null;
          }
        });
    }
  }

  async login() {
    const { username, auth_password } = this.registerForm.value;
    await this.sessionService.login(username!, auth_password!);
  }
}
