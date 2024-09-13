import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerPropertiesDialogComponent } from './layer-properties-dialog.component';

describe('LayerPropertiesDialogComponent', () => {
  let component: LayerPropertiesDialogComponent;
  let fixture: ComponentFixture<LayerPropertiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerPropertiesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LayerPropertiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
