import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseMapComponent } from './rise-map.component';

describe('RiseMapComponent', () => {
  let component: RiseMapComponent;
  let fixture: ComponentFixture<RiseMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
