export interface Sends {
  id: number;
  type: string;
  formato: string;
  insertDate: string; // o Date, se converti in runtime
  senderComplete: string;
  userComplete: string;
  namesComplete: string;
  requestId: string;
  codice: string;
  valid: string;
  currentState: string;
  currentStateInt: number;
  stato: string;
  pageNumber: number;
  notificato: boolean;
  fileName: string;
  attacchedFile: Uint8Array; // oppure `string` se arriva base64 dal backend
  dataConsegna: string | null; // o `Date | null` se converti in runtime
}
