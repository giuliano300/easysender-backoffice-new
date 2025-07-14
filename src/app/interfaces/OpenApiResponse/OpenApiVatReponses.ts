import { Data } from "./Data";

export interface OpenApiVatReponses {
    data: Data[];
    success: boolean;
    message: string;
    error: string;
  }