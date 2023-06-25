import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDrtComponent } from './issue-drt.component';

describe('IssueDrtComponent', () => {
  let component: IssueDrtComponent;
  let fixture: ComponentFixture<IssueDrtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueDrtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueDrtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
