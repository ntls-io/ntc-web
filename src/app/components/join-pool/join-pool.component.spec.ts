import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPoolComponent } from './join-pool.component';

describe('JoinPoolComponent', () => {
  let component: JoinPoolComponent;
  let fixture: ComponentFixture<JoinPoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinPoolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
