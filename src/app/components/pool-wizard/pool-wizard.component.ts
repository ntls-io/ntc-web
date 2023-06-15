import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  NgWizardConfig,
  NgWizardService,
  StepChangedArgs,
  StepValidationArgs,
  STEP_POSITION,
  STEP_STATE,
  THEME
} from 'ng-wizard';
import { FileUploader } from 'ng2-file-upload';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { defer, of } from 'rxjs';
import { PoolDataService } from 'src/app/states/pool-data';
import { AjvService } from 'src/app/utils/ajv.service';
import Swal from 'sweetalert2';
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
  @Output() onFinish = new EventEmitter<null>();
  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.default,
    toolbarSettings: {
      toolbarExtraButtons: [
        {
          text: 'Finish',
          class: 'btn btn-secondary finish-btn d-none',
          event: async () => {
            const mode = this.mode === 'create' ? 'created' : 'joined';

            if (mode === 'created') {
              const data = {
                id: Math.random().toString(36).slice(-3),
                name: this.poolData.name,
                description: this.poolData.description,
                drt: this.drtOptions
                  .filter(drt => drt.checked)
                  .map(drt => ({
                    name: drt.name,
                    description: drt.description
                  }))
              };
              this.poolDataService.createPool(data);
            }
            await Swal.fire({
              icon: 'success',
              titleText: 'Great stuff!',
              text: `You have successfully ${mode} a data pool`,
              confirmButtonColor: '#000'
            }).finally(() => {
              this.resetData();
              this.ngWizardService.reset();
              this.onFinish.emit();
            });
          }
        }
      ]
    }
  };

  selectedPosition: STEP_POSITION | undefined;

  isValidTypeBoolean: boolean = true;

  uploaderSchema = new FileUploader(uploaderConfig);
  uploaderData = new FileUploader(uploaderConfig);
  isSchemaValid: { success: unknown; error: string } | undefined;
  isPackageValid = { state: STEP_STATE.normal, message: '' };

  scPrevModal?: BsModalRef;

  drtOptions = [
    {
      name: 'Append',
      description: 'Allow others to append their data and join your pool',
      checked: false
    },
    {
      name: 'Average',
      description:
        'Allow others to calculate averages on integer values in your data',
      checked: false
    }
  ];

  poolData = {
    name: '',
    description: ''
  };

  constructor(
    private ajv: AjvService,
    private modalService: BsModalService,
    private ngWizardService: NgWizardService,
    private poolDataService: PoolDataService
  ) {}

  ngOnInit() {}

  stepChanged(args: StepChangedArgs) {
    const fBtn = document.querySelector(`#${this.mode} .finish-btn`);
    if (args.position === STEP_POSITION.final) {
      fBtn?.classList.remove('d-none');
    } else {
      fBtn?.classList.add('d-none');
    }
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

  resetData() {
    this.drtOptions.forEach(drt => (drt.checked = false));
    this.poolData = {
      name: '',
      description: ''
    };
    this.uploaderSchema.clearQueue();
    this.uploaderData.clearQueue();
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
