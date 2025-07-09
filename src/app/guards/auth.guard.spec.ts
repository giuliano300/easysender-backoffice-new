import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard], // Aggiungi AuthGuard ai provider
    });
    guard = TestBed.inject(AuthGuard); // Ottieni l'istanza dell'AuthGuard
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
