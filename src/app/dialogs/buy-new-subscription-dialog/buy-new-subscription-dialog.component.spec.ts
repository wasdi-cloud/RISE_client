import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyNewSubscriptionDialogComponent } from './buy-new-subscription-dialog.component';

describe('BuyNewSubscriptionDialogComponent', () => {
  let component: BuyNewSubscriptionDialogComponent;
  let fixture: ComponentFixture<BuyNewSubscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyNewSubscriptionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuyNewSubscriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
