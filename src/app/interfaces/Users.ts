export interface Users {
  id: number;
  parentId: number;
  userTypes: number;
  guid: string;
  businessName: string;
  vatNumber: string;
  email: string;
  province?: string;
  mobile?: string;
  password?: string;
  address: string;
  city: string;
  zipCode: string;
  pec: string;
  usernamePoste: string;
  passwordPoste: string;
  enabled: boolean;
  deleted: boolean;
  arraySenderId: string;
}
