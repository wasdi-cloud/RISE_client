import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicToolDialogComponent } from './magic-tool-dialog.component';

describe('MagicToolDialogComponent', () => {
  let component: MagicToolDialogComponent;
  let fixture: ComponentFixture<MagicToolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicToolDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MagicToolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
