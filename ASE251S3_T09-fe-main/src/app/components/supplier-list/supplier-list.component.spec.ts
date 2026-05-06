import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SupplierListComponent } from './supplier-list.component';
import { SupplierService } from '../../services/supplier.service';

describe('SupplierListComponent', () => {
  let component: SupplierListComponent;
  let fixture: ComponentFixture<SupplierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierListComponent],
      providers: [
        {
          provide: SupplierService,
          useValue: {
            listar: () => of([]),
            crear: () => of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});