export interface OperationListItem {
  id: number;
  insertDate: string;
  name: string;
  operationType: number;
  complete: boolean;
  error: boolean;
  errorMessage?: string | null;
  userName: string;
  recipients: number;
  inProgress: number;
  posteCallClaims: number;
}
