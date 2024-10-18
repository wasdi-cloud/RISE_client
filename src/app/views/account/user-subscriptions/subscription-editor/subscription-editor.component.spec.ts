import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionEditorComponent } from './subscription-editor.component';

describe('SubscriptionEditorComponent', () => {
  let component: SubscriptionEditorComponent;
  let fixture: ComponentFixture<SubscriptionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
