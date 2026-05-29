export interface CompleteUserRegistration {
  id: number;
  vatNumber: string;
  businessName: string;
  address: string;
  city: string;
  zipCode: string;
  mobile: string;
  pec: string;
  usernamePoste: string;
  passwordPoste: string;
  email: string;
  password: string;  
  molContractCode: string;
  colContractCode: string;
  col4ContractCode: string;
  volContractCode: string;
  agolContractCode: string;  
  hidePrice: string;
  rr: string;
  ged: string;
  usernamePosteGed: string;
  passwordPosteGed: string;
  guidUserOldSite?: string;
  pwdOldSite?: string;
  doubleFactor: boolean;
}