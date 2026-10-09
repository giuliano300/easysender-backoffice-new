export interface Users {
  id: number;
  parentId: number;
  accountOwnerId?: number;
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
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  enabled: boolean;
  deleted: boolean;
  passwordOldSite?: string;
  usernameOldSite?: string;
  arraySenderId: string;
  doubleFactor?: boolean;
}
