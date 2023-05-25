import { Component, Input } from '@angular/core';
import {
  NgWizardConfig,
  StepChangedArgs,
  StepValidationArgs,
  STEP_STATE,
  THEME
} from 'ng-wizard';
import { FileUploader } from 'ng2-file-upload';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { defer, of } from 'rxjs';
import { AjvService } from 'src/app/utils/ajv.service';
import { SchemaPreviewComponent } from '../schema-preview/schema-preview.component';

const uploaderConfig = {
  url: '',
  disableMultipart: true,
  allowedMimeType: ['application/json']
};

@Component({
  selector: 'app-pool-wizard',
  templateUrl: './pool-wizard.component.html',
  styleUrls: ['./pool-wizard.component.scss']
})
export class PoolWizardComponent {
  @Input() mode: 'join' | 'create' = 'create';
  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.default
  };

  isValidTypeBoolean: boolean = true;

  uploaderSchema = new FileUploader(uploaderConfig);
  uploaderData = new FileUploader(uploaderConfig);
  isSchemaValid: { success: unknown; error: string } | undefined;
  isPackageValid = { state: STEP_STATE.normal, message: '' };

  scPrevModal?: BsModalRef;

  constructor(private ajv: AjvService, private modalService: BsModalService) {}

  ngOnInit() {}

  stepChanged(args: StepChangedArgs) {
    console.log(args.step);
  }

  async previewModal(schema: Blob) {
    const schemaFileAsText = (await this.ajv.readAsText(schema)) as string;
    const schemaFileObject = JSON.parse(schemaFileAsText) as object;

    const initialState: ModalOptions = {
      initialState: {
        schema: schemaFileObject
      },
      class: 'modal-dialog-centered'
    };
    this.scPrevModal = this.modalService.show(
      SchemaPreviewComponent,
      initialState
    );
  }

  async validateSchema(event: File[]) {
    this.isSchemaValid = await this.ajv.validateSchemaFile(event[0]);
  }

  validatePackage(args: StepValidationArgs) {
    return defer(() => this.validateDataSchema());
  }

  async validateDataSchema() {
    let result = { success: true, error: '' };

    if (this.mode === 'create') {
      result = await this.ajv.validateJsonDataAgainstSchema(
        this.uploaderData.queue[0]._file,
        this.uploaderSchema.queue[0]._file
      );
    }
    this.isPackageValid = result.success
      ? { state: STEP_STATE.normal, message: '' }
      : { state: STEP_STATE.error, message: result.error };

    console.log(result);
    return result.success;
  }

  resetPackageStep() {
    this.isPackageValid = { state: STEP_STATE.normal, message: '' };
  }

  isValidFunctionReturnsBoolean(args: StepValidationArgs) {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs) {
    return of(true);
  }
}