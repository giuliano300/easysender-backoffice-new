import { AbstractControl, ValidationErrors } from '@angular/forms';

export function italianVatValidator(control: AbstractControl): ValidationErrors | null {
  const vat = control.value;

  if (!vat) return null; // campo vuoto: validazione gestita altrove
  if (!/^\d{11}$/.test(vat)) {
    return { invalidFormat: true }; // non sono 11 cifre
  }

  const digits = vat.split('').map((d: string | number) => + d);
  let sum = 0;

  for (let i = 0; i <= 9; i++) {
    let num = digits[i];
    if ((i % 2) === 0) { // posizione dispari (indice pari, zero-based)
      sum += num;
    } else {
      num *= 2;
      if (num > 9) num -= 9;
      sum += num;
    }
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (expectedCheckDigit !== digits[10]) {
    return { invalidVat: true };
  }

  return null;
}
