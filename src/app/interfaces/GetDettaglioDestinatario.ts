import { recipients } from './recipients';
import { senders } from './senders';
import { historicRecipientStatus } from './historicRecipientStatus';

export interface GetDettaglioDestinatario {
  recipient: recipients;
  sender: senders;
  historicRecipientStatuses: historicRecipientStatus[];
}