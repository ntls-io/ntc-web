import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PoolData, PoolDataQuery } from 'src/app/states/pool-data';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-join-pool',
  templateUrl: './join-pool.component.html',
  styleUrls: ['./join-pool.component.scss']
})
export class JoinPoolComponent implements OnInit {
  id!: string;
  pool?: PoolData;

  uploaderData = new FileUploader({
    url: '',
    disableMultipart: true,
    allowedMimeType: ['application/json']
  });

  constructor(
    public bsModalRef: BsModalRef,
    private poolDataQuery: PoolDataQuery
  ) {}

  ngOnInit(): void {
    this.pool = this.poolDataQuery.getEntity(this.id);
  }

  async joinPool(): Promise<void> {
    await Swal.fire({
      icon: 'success',
      titleText: `Welcome to the ${this.pool?.name}!`,
      text: `You have successfully joined the pool`,
      confirmButtonColor: '#000'
    }).finally(() => {
      this.bsModalRef.hide();
    });
  }
}
