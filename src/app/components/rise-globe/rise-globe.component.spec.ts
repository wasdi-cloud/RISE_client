import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseGlobeComponent } from './rise-globe.component';

describe('RiseGlobeComponent', () => {
  let component: RiseGlobeComponent;
  let fixture: ComponentFixture<RiseGlobeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseGlobeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseGlobeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
