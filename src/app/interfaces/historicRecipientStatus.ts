export interface historicRecipientStatus {
  id: number;
  recipientId: number;
  insertDate: string; // DateTime in C# si rappresenta generalmente come stringa ISO in TS
  message?: string | null;
}
