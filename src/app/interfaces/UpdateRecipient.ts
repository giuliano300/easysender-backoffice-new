export interface UpdateRecipient {
  id: number | null;
  recipient: string;

  sender?: string;
  complementNameSender?: string;
  addressSender?: string;
  complementAddressSender?: string;
  zipCodeSender?: string;
  citySender?: string;
  stateSender?: string;

  senderAR?: string;
  complementNameSenderAR?: string;
  addressSenderAR?: string;
  complementAddressSenderAR?: string;
  zipCodeSenderAR?: string;
  citySenderAR?: string;
  stateSenderAR?: string;

  complementName: string;
  address?: string;
  complementAddress: string;
  zipCode?: string;
  city?: string;
  state?: string;
  fileName: string;
  attachedFile: string;
}
