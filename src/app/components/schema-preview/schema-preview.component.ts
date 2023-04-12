import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-schema-preview',
  templateUrl: './schema-preview.component.html',
  styleUrls: ['./schema-preview.component.scss']
})
export class SchemaPreviewComponent {
  schema: any;
  constructor(public bsModalRef: BsModalRef) {}
}
