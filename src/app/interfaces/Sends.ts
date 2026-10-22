export interface Sends {
  id: number;
  operationId: number;
  productType: number;
  type: string;
  formato: string;
  insertDate: string; // o Date, se converti in runtime
  senderComplete: string;
  ar: string;
  arBool: boolean;
  userComplete: string;
  namesComplete: string;
  recipient: string;
  requestId: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  state: string;
  codice: string;
  valid: string;
  currentState: string;
  currentStateInt: number;
  currentStateChangedAt?: string | null;
  waitingMinutes?: number | null;
  canUnlock: boolean;
  stato: string;
  pageNumber: number;
  notificato: boolean;
  hasArScan: boolean;
  arScanLoading?: boolean;
  unblocking?: boolean;
  reporting?: boolean;
  pathFile: string;
  fileName: string;
  attacchedFile: Uint8Array; // oppure `string` se arriva base64 dal backend
  attacchedFileRR: Uint8Array; // oppure `string` se arriva base64 dal backend
  attacchedFileRA: Uint8Array; // oppure `string` se arriva base64 dal backend
  dataConsegna: string | null; // o `Date | null` se converti in runtime

  sender: string;
  addressSender: string;
  citySender: string;
  provinceSender: string;
  zipCodeSender: string;
  stateSender: string;
  senderAR: string;
  addressSenderAR: string;
  citySenderAR: string;
  provinceSenderAR: string;
  zipCodeSenderAR: string;
  stateSenderAR: string;

}
