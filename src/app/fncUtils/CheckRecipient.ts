
import { Recipients } from "../classes/Recipients";
import { ComuniXLS } from "./fncUtils";

export class checkRecipient {
  recipient: Recipients | null = null;
  valido: boolean = true;
  errore: string = '';
}

// Interfaccia del risultato di controllo
export interface Crt {
  valido: boolean;
  errore: string;
  indirizzovalido?: boolean;
}

export function CheckRecipient(
  recipient: Recipients,
  comuni: ComuniXLS[], // lista dei comuni da controllare
  verificaFileName: boolean = true
): checkRecipient {
  let ctrl: checkRecipient = {
    recipient,
    valido: true,
    errore: ''
  };

  const cap = recipient.zipCode.replace(/\s+/g, '');

  // CONTROLLO CAP
  const crtCap = verificaCap(cap, comuni.length, recipient.state);
  if (!crtCap.valido) {
    ctrl.valido = false;
    ctrl.errore = crtCap.errore + ' - destinatario';
    return ctrl;
  }

  // CONTROLLO RAGIONE SOCIALE / NOMINATIVO
  const crtRS = verificaRagioneSociale(recipient.businessName);
  if (!crtRS.valido) {
    ctrl.valido = false;
    ctrl.errore = crtRS.errore + ' - destinatario';
    return ctrl;
 }

  // CONTROLLO INDIRIZZO
  const crtAddr = verificaIndirizzo(recipient.address);
  if (!crtAddr.valido) {
    ctrl.valido = false;
    ctrl.errore = crtAddr.errore + ' - destinatario';
    return ctrl;
  }

  // CONTROLLO CITTÀ
  const crtCitta = verificaCitta(recipient.city);
  if (!crtCitta.valido) {
    ctrl.valido = false;
    ctrl.errore = crtCitta.errore + ' - destinatario';
    return ctrl;
  }

  // CONTROLLO CF
  const crtCf = controlloFormaleCf(recipient.fiscalCode);
  if (!crtCf.valido) {
    ctrl.valido = false;
    ctrl.errore = 'Codice fiscale - destinatario';
    return ctrl;
  }

  // CONTROLLO PROVINCIA
  const crtProv = verificaProvincia(recipient.province, recipient.state);
  if (!crtProv.valido) {
    ctrl.valido = false;
    ctrl.errore = crtProv.errore + ' - destinatario';
    return ctrl;
  }

  // CONTROLLO CAP-COMUNE-PROVINCIA
  if (recipient.state.toLowerCase() === 'italia') {
    if (comuni.length > 0) {
      const crtCcp = verificaCapComuneProvincia(comuni, cap, recipient.city, recipient.province);
      if (!crtCcp.valido) {
        ctrl.valido = false;
        ctrl.errore = crtCcp.errore + ' - destinatario';
        return ctrl;
      }
    } else {
      ctrl.valido = false;
      ctrl.errore = 'Cap non corretto - destinatario';
      return ctrl;
    }
  }

  // CONTROLLO STATO
  const crtStato = verificaStato(recipient.state);
  if (!crtStato.valido) {
    ctrl.valido = false;
    ctrl.errore = crtStato.errore + ' - destinatario';
    return ctrl;
  }

  // CONTROLLO FILE NAME
  if (verificaFileName) {
    const crtFN = verificaFileNameFn(recipient.fileName!);
    if (!crtFN.valido) {
      ctrl.valido = false;
      ctrl.errore = crtFN.errore + ' - destinatario';
      return ctrl;
   }
  }

  return ctrl;
}


function controlloFormaleCf(cf: string | null | undefined): Crt {
  const crt: Crt = {
    errore: '',
    valido: true,
  };

  if (!cf) {
    // se cf è null, undefined o stringa vuota => valido = true
    return crt;
  }

  const checkRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  if (cf.length < 16) {
    crt.errore = 'Il codice fiscale non rispetta la lunghezza minima.';
    crt.valido = false;
    return crt;
  }

  cf = Normalize(cf, false);

  if (!checkRegex.test(cf)) {
    const cf_NoOmocodia = SostituisciLettereOmocodia(cf);
    if (!checkRegex.test(cf_NoOmocodia)) {
      crt.errore = 'Il codice fiscale non è nella forma corretta.';
      crt.valido = false;
      return crt;
    }
  }

  return crt;
}

function Normalize(s: string, normalizeDiacritics: boolean): string {
  if (!s) return s;

  s = s.trim().toUpperCase();

  if (normalizeDiacritics) {
    const src = "ÀÈÉÌÒÙàèéìòù";
    const rep = "AEEIOUAEEIOU";
    for (let i = 0; i < src.length; i++) {
      // sostituisce tutte le occorrenze del carattere src[i] con rep[i]
      s = s.split(src[i]).join(rep[i]);
    }
  }
  return s;
}

function SostituisciLettereOmocodia(cf: string): string {
  const OmocodeChars = "LMNPQRSTUV";
  const cfChars = cf.split('');
  const pos = [6, 7, 9, 10, 12, 13, 14];

  pos.forEach(i => {
    const char = cfChars[i];
    // se non è un numero
    if (char && isNaN(parseInt(char, 10))) {
      const idx = OmocodeChars.indexOf(char);
      if (idx !== -1) {
        cfChars[i] = idx.toString();
      }
    }
  });

  return cfChars.join('');
}


function verificaCapComuneProvincia(
  comune: ComuniXLS[],
  cap: string,
  city: string,
  province: string
): Crt {
  const ctrl: Crt = {
    errore: '',
    valido: true,
  };

  const msgerrore = 'i dati cap/provincia/comune non sono congruenti!';

  if (!comune.some(a => a.cap.includes(cap))) {
    ctrl.errore = msgerrore;
    ctrl.valido = false;
    return ctrl;
  }

  const cl = city.toLowerCase();
  if (!comune.some(a => a.comune.toLowerCase().includes(cl))) {
    ctrl.errore = msgerrore;
    ctrl.valido = false;
    return ctrl;
  }

  const sig = province.toLowerCase();
  if (!comune.some(a => a.sigla.toLowerCase().includes(sig))) {
    ctrl.errore = msgerrore;
    ctrl.valido = false;
    return ctrl;
  }

  return ctrl;
}

function verificaFileNameFn(fileName: string): Crt {
  const ctrl: Crt = {
    errore: '',
    valido: true
  };

  if (!fileName || fileName.trim() === '') {
    ctrl.errore = 'file vuoto';
    ctrl.valido = false;
    return ctrl;
  }

  const parts = fileName.split('.');

  if (parts.length < 2) {
    ctrl.errore = "l'estensione del file non è consentita";
    ctrl.valido = false;
    return ctrl;
  }

  const extension = parts[parts.length - 1].toUpperCase();

  if (extension !== 'PDF') {
    ctrl.errore = "l'estensione del file non è consentita";
    ctrl.valido = false;
    return ctrl;
  }

  return ctrl;
}

// Funzione di verifica codice cliente
export function verificaCodiceCliente(codiceCliente: string): Crt {
  const ctrl: Crt = { valido: true, errore: '' };

  if (!codiceCliente) {
    return { valido: false, errore: 'Campo CodiceCliente vuoto - Bollettino' };
  }

  if (!/^[0-9]+$/.test(codiceCliente)) {
    return { valido: false, errore: 'Campo CodiceCliente deve contenere solo numeri' };
  }

  if (codiceCliente.length !== 18) {
    return { valido: false, errore: 'Campo CodiceCliente non ha la lunghezza consentita di 18 numeri' };
  }

  const firstCod = parseInt(codiceCliente.substring(0, 16), 10);
  const lastCod = parseInt(codiceCliente.substring(16), 10);
  const codiceControllo = firstCod % 93;

  if (codiceControllo !== lastCod) {
    return {
      valido: false,
      errore: 'Nel Campo CodiceCliente il controcodice non è valido (Primi 16 caratteri mod 93)'
    };
  }

  return ctrl;
}

// Funzione di verifica ragione sociale o nome e cognome
export function verificaRagioneSociale(
  ragioneSociale: string = '',
): Crt {
  const ctrl: Crt = { valido: true, errore: '' };

  if (ragioneSociale.length > 44) {
    return { valido: false, errore: 'Ragione sociale più di 44 caratteri' };
  }

  if (ragioneSociale.length === 0) {
    return { valido: false, errore: 'Inserire Nome e Cognome o Ragione Sociale' };
  }

  return ctrl;
}

export function verificaIndirizzo(
  indirizzo: string
): Crt {
  const ctrl: Crt = { valido: true, errore: '' };

  if (indirizzo.length === 0) {
    return { valido: false, errore: 'Indirizzo vuoto' };
  }

  if (indirizzo.length > 44) {
    return {
      valido: false,
      errore: 'Indirizzo supera la lunghezza massima. Utilizzare il campo complemento indirizzo.'
    };
  }

  return ctrl;
}

export function verificaIndirizzoMittente(
  indirizzo: string
): Crt {
  const ctrl: Crt = { valido: true, errore: '' };

  if (indirizzo.length === 0) {
    return { valido: false, errore: 'Indirizzo vuoto' };
  }

  if (indirizzo.length > 44) {
    return {
      valido: false,
      errore: 'Indirizzo supera la lunghezza massima. Utilizzare il campo complemento indirizzo.'
    };
  }

  return ctrl;
}


export function verificaCap(cap: string, i: number, state: string = 'italia'): Crt {
  const ctrl: Crt = {
    valido: true,
    errore: ''
  };

  if (state.toLowerCase() !== 'italia') {
    return ctrl;
  }

  if (cap.length === 0) {
    ctrl.errore = 'Cap inesistente';
    ctrl.valido = false;
  } else if (cap.length !== 5) {
    ctrl.errore = 'Lunghezza cap non valida';
    ctrl.valido = false;
  }

  if (i === 0) {
    ctrl.errore = 'Cap non valido';
    ctrl.valido = false;
  }

  return ctrl;
}

export function verificaProvincia(provincia: string, state = 'italia'): Crt {
  if (state.toLowerCase() !== 'italia') return { valido: true, errore: '' };
  if (provincia.length === 0) {
    return { valido: false, errore: 'provincia vuota' };
  }
  if (provincia.length > 2) {
    return { valido: false, errore: 'il campo provincia deve avere 2 caratteri' };
  }
  if (!onlyLetters(provincia)) {
    return { valido: false, errore: 'nel campo provincia sono inseriti caratteri non validi' };
  }
  return { valido: true, errore: '' };
}

export function verificaStato(stato: string): Crt {
  if (stato.length === 0) {
    return { valido: false, errore: 'stato vuoto' };
  }
  const statoUpper = stato.toUpperCase();
  if (statoUpper !== 'ITALIA') {
    if (statoUpper.includes('ITA')) {
      return { valido: false, errore: 'Il campo stato ITALIA deve essere scritto per esteso' };
    }  
  }
  return { valido: true, errore: '' };
}


export function verificaCitta(city: string): Crt {
  if (city.length === 0) {
    return { valido: false, errore: 'città vuota' };
  }
  return { valido: true, errore: '' };
}


export function onlyNumbers(value: string): boolean {
    return /^[0-9]+$/.test(value);
}

export function onlyLetters(value: string): boolean {
    return /^[A-Za-zÀ-ÿ]+$/.test(value);
}