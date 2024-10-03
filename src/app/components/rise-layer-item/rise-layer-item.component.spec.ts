import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseLayerItemComponent } from './rise-layer-item.component';

describe('RiseLayerItemComponent', () => {
  let component: RiseLayerItemComponent;
  let fixture: ComponentFixture<RiseLayerItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseLayerItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseLayerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
