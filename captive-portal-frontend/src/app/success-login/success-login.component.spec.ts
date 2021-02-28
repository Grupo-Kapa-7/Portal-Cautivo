import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessLoginComponent } from './success-login.component';

describe('SuccessLoginComponent', () => {
  let component: SuccessLoginComponent;
  let fixture: ComponentFixture<SuccessLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
