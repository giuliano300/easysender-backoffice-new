export interface UpdateRecipient {
  id: number | null;
  productType: number;
  recipient: string;

  sender?: string;
  complementNameSender?: string;
  addressSender?: string;
  complementAddressSender?: string;
  zipCodeSender?: string;
  citySender?: string;
  provinceSender?: string;
  stateSender?: string;

  senderAR?: string;
  complementNameSenderAR?: string;
  addressSenderAR?: string;
  complementAddressSenderAR?: string;
  zipCodeSenderAR?: string;
  citySenderAR?: string;
  provinceSenderAR?: string;
  stateSenderAR?: string;

  complementName: string;
  address?: string;
  complementAddress: string;
  zipCode?: string;
  city?: string;
  province?: string;
  state?: string;
  fileName: string;
  attachedFile: string;
  bulletin?: BulletinUpdate | null;
}

export interface BulletinUpdate {
  id?: number;
  numeroContoCorrente: string;
  intestatoA: string;
  importoEuro: string;
  eseguitoDaNominativo: string;
  eseguitoDaIndirizzo: string;
  eseguitoDaLocalita: string;
  annoDiRiferimento: string;
  eseguitoDaCap: string;
  codiceCliente: string;
  causale?: string | null;
  iban?: string | null;
}
