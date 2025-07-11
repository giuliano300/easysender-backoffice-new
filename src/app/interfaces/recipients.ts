export interface recipients {
  id: number;
  insertDate: string; // DateTime in C# -> string ISO in TS
  operationId: number;
  logoId?: number | null;
  productType: number;
  businessName: string;
  complementName?: string | null;
  address: string;
  complementAddress?: string | null;
  zipCode: string;
  city: string;
  province: string;
  state: string;
  currentState: number;
  valid: boolean;
  format: number;
  printType: number;
  frontBack: number;
  returnReceipt: boolean;
  code?: string | null;
  codiceAgolAr?: string | null;
  numberOfPages?: number | null;
  tipologiaNotificante?: number | null;
  valoreNotificante?: string | null;
  pec?: string | null;
  price?: number | null;
  vatPrice?: number | null;
  totalPrice?: number | null;
  attachedFile?: Uint8Array | null; // byte[] in C# -> Uint8Array o ArrayBuffer in TS
  attachedFileRR?: Uint8Array | null;
  attachedFileRA?: Uint8Array | null;
  fileName?: string | null;
  pathRecoveryFile?: string | null;
  pathGEDUrl?: string | null;
  digitalReturnReceipt?: boolean | null;
  message?: string | null;
  tag1?: string | null;
  tag2?: string | null;
  tag3?: string | null;
  tag4?: string | null;
  tag5?: string | null;
  tag6?: string | null;
  telegramText?: string | null;
  notified?: boolean | null;
  fromApi: boolean;

  // VISURA
  vat?: string | null;
  cciaa?: string | null;
  reaNumber?: string | null;
  typeVisura?: number | null;
}
