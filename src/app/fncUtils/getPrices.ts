import { ProductTypes } from "../interfaces/EnumTypes";

export class Prices {
  vatPrice: number = 0;
  totalPrice: number = 0;
  price: number = 0;
}

function GetVat(amount: number): number {
  // Implementa la funzione che calcola la VAT (IVA)
  // Per esempio, supponiamo 22% di IVA:
  return amount * 0.22;
}

export function GetFilePrice(productType:number, numberOfPages: number, colori: boolean, tipoPosta: string = 'Posta4'): Prices 
{
  let type = 'LOL';
  if(productType == ProductTypes.ROL)
    type = 'ROL';
  if(productType == ProductTypes.TOL)
    type = 'TOL';

  let totale = 0;

  if(type == 'TOL'){
    return {
      vatPrice: 5.01,
      totalPrice: 27.80,
      price: 22.79
    } as Prices;
  }

  const count = numberOfPages;

  if (count === 1) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 2.49 : 2.32;
      } else {
        totale = colori ? 1.24 : 1.07;
      }
    } else if (type === 'ROL') {
      totale = colori ? 4.00 : 3.70;
    }
  }

  else if (count === 2) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 2.60 : 2.40;
      } else {
        totale = colori ? 1.35 : 1.15;
      }
    } else if (type === 'ROL') {
      totale = colori ? 4.15 : 3.80;
    }
  }

  else if (count === 3) {
    if (tipoPosta === 'Posta1') {
      totale = colori ? 2.69 : 2.46;
    } else {
      totale = colori ? 1.44 : 1.21;
    }
    if (type === 'ROL') {
      totale = colori ? 4.30 : 3.90;
    }
  }

  else if (count === 4 || count === 5) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 2.81 : 2.55;
      } else {
        totale = colori ? 2.66 : 2.40;
      }
    } else if (type === 'ROL') {
      totale = colori ? 5.35 : 5.05;
    }
  }

  else if (count >= 6 && count <= 9) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 3.03 : 2.67;
      } else {
        totale = colori ? 2.88 : 2.52;
      }
    } else if (type === 'ROL') {
      totale = colori ? 5.70 : 5.10;
    }
  }

  else if (count >= 10 && count <= 13) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 3.33 : 2.85;
      } else {
        totale = colori ? 3.18 : 2.70;
      }
    } else if (type === 'ROL') {
      totale = colori ? 5.85 : 5.15;
    }
  }

  else if (count > 13) {
    if (type === 'LOL') {
      if (tipoPosta === 'Posta1') {
        totale = colori ? 3.78 : 3.15;
      } else {
        totale = colori ? 3.63 : 3.00;
      }
    } else if (type === 'ROL') {
      totale = colori ? 6.00 : 5.20;
    }
  }

  let p: Prices = {
    vatPrice: 0,
    totalPrice: totale,
    price: totale,
  };

  if (type === 'LOL') {
    const vat = GetVat(totale);
    p.vatPrice = vat;
    p.price = totale - vat;
  } else if (type === 'ROL') {
    p.vatPrice = 0;
    p.price = totale;
  }

  return p;
}
