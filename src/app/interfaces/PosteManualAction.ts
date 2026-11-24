export interface PosteManualActionDefinition {
  product: string;
  action: string;
  label: string;
  requiresRequestId: boolean;
  directResponse: boolean;
}

export interface PosteManualAction {
  id: string;
  recipientId: number;
  product: string;
  action: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string | null;
  requestedBy: string;
  requestPayload?: string | null;
  responsePayload?: string | null;
  error?: string | null;
}
