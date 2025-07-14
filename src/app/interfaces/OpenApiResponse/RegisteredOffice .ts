import { Gps } from "./Gps ";
import { Region } from "./Region ";

export interface RegisteredOffice {
    toponym: string;
    street: string;
    streetNumber: string;
    streetName: string;
    town: string;
    hamlet: string | null;
    province: string;
    zipCode: string;
    gps: Gps;
    region: Region;
    townCode: string;
  }