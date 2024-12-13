import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerAnalyzerComponent } from './layer-analyzer.component';

describe('LayerAnalyzerComponent', () => {
  let component: LayerAnalyzerComponent;
  let fixture: ComponentFixture<LayerAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerAnalyzerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LayerAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
