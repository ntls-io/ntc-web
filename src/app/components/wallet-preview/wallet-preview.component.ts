import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wallet-preview',
  templateUrl: './wallet-preview.component.html',
  styleUrls: ['./wallet-preview.component.scss']
})
export class WalletPreviewComponent {
  address!: string;
  constructor(public bsModalRef: BsModalRef) {}

  async copyAddress(address: string) {
    await navigator.clipboard.writeText(address).then(() => {
      Swal.fire({
        icon: 'success',
        titleText: 'Copied to clipboard',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        position: 'bottom-end'
      });
    });
  }
}
