import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptivePortalComponent } from './captive-portal.component';

describe('CaptivePortalComponent', () => {
  let component: CaptivePortalComponent;
  let fixture: ComponentFixture<CaptivePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaptivePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptivePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
