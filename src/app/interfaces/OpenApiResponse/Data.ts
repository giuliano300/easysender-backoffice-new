import { Address } from "./Address";
import { AtecoClassification } from "./AtecoClassification";
import { BalanceSheets } from "./BalanceSheets";
import { DetailedLegalForm } from "./DetailedLegalForm";
import { ShareHolder } from "./ShareHolder";
import { VatGroup } from "./VatGroup";

export interface Data {
    taxCode: string;
    vatCode: string;
    companyName: string;
    address: Address;
    activityStatus: string;
    reaCode: string;
    cciaa: string;
    atecoClassification: AtecoClassification;
    detailedLegalForm: DetailedLegalForm;
    startDate: string; // ISO string, es: '2023-12-31'
    registrationDate: string;
    endDate?: string | null;
    pec: string;
    taxCodeCeased: boolean;
    taxCodeCeasedTimestamp: number;
    vatGroup: VatGroup;
    sdiCode: string;
    sdiCodeTimestamp: number;
    creationTimestamp: number;
    lastUpdateTimestamp: number;
    balanceSheets: BalanceSheets;
    shareHolders: ShareHolder[];
    id: string;
  }