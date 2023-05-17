import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BsModalService } from 'ngx-bootstrap/modal';
import { CreatePoolComponent } from './create-pool.component';

describe('CreatePoolComponent', () => {
  let component: CreatePoolComponent;
  let fixture: ComponentFixture<CreatePoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePoolComponent],
      providers: [BsModalService]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
