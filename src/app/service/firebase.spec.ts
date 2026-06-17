import { TestBed } from '@angular/core/testing';
import { FirebaseService } from './firebase'; // Ajuste o caminho se o nome do arquivo for diferente

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});