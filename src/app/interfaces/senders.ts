export interface senders {
  id: number;
  operationId: number;
  businessName: string;
  complementNames?: string | null;
  address: string;
  complementAddress?: string | null;
  zipCode: string;
  city: string;
  province: string;
  state: string;
  email?: string | null;
  mobile?: string | null;
  AR?: boolean | null;
}