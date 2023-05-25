import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BsModalService } from 'ngx-bootstrap/modal';
import { PoolWizardComponent } from './pool-wizard.component';

describe('PoolWizardComponent', () => {
  let component: PoolWizardComponent;
  let fixture: ComponentFixture<PoolWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PoolWizardComponent],
      providers: [BsModalService]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
