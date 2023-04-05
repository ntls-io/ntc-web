import { Component, OnInit } from "@angular/core";
import {
  NgWizardConfig,
  NgWizardService,
  StepChangedArgs,
  StepValidationArgs,
  STEP_STATE,
  THEME
} from "ng-wizard";
import { FileUploader } from "ng2-file-upload";
import { of } from "rxjs";

const uploaderConfig = {
  url: "",
  disableMultipart: true,
  allowedMimeType: ["application/json"]
};

@Component({
  selector: "app-create-pool",
  templateUrl: "./create-pool.component.html",
  styleUrls: ["./create-pool.component.scss"]
})
export class CreatePoolComponent implements OnInit {
  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.arrows
  };

  isValidTypeBoolean: boolean = true;

  uploaderSchema = new FileUploader(uploaderConfig);
  uploaderData = new FileUploader(uploaderConfig);

  constructor(private ngWizardService: NgWizardService) {}

  ngOnInit() {}

  showPreviousStep(event?: Event) {
    this.ngWizardService.previous();
  }

  showNextStep(event?: Event) {
    this.ngWizardService.next();
  }

  resetWizard(event?: Event) {
    this.ngWizardService.reset();
  }

  setTheme(theme: THEME) {
    this.ngWizardService.theme(theme);
  }

  stepChanged(args: StepChangedArgs) {
    console.log(args.step);
  }

  isValidFunctionReturnsBoolean(args: StepValidationArgs) {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs) {
    return of(true);
  }
}
