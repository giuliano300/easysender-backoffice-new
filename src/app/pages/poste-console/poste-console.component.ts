import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PosteManualAction, PosteManualActionDefinition } from '../../interfaces/PosteManualAction';
import { PosteManualActionsService } from '../../services/poste-manual-actions.service';
import { WatchdogService } from '../../services/watchdog.service';
import { WatchdogStatus } from '../../interfaces/Watchdog';

@Component({
  selector: 'app-poste-console',
  imports: [DatePipe, NgClass, NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './poste-console.component.html',
  styleUrl: './poste-console.component.scss'
})
export class PosteConsoleComponent implements OnInit, OnDestroy {
  definitions: PosteManualActionDefinition[] = [];
  actions: PosteManualAction[] = [];
  recipientId: number | null = null;
  selectedAction = '';
  loading = true;
  submitting = false;
  error = '';
  success = '';
  watchdog: WatchdogStatus | null = null;
  recipient: { id: number; product: string; currentState: number; requestId?: string | null; code?: string | null; message?: string | null } | null = null;
  confirmingAction = false;
  selectedResponse: PosteManualAction | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly actionsService: PosteManualActionsService, private readonly watchdogService: WatchdogService) {}

  ngOnInit(): void {
    this.actionsService.definitions().subscribe({
      next: definitions => { this.definitions = definitions; this.loading = false; },
      error: () => { this.error = 'Impossibile leggere le funzioni Poste disponibili.'; this.loading = false; }
    });
    this.refresh();
    this.refreshTimer = setInterval(() => this.refresh(), 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  get availableActions(): PosteManualActionDefinition[] { return this.recipient ? this.definitions : []; }

  get issues() {
    return (this.watchdog?.checks ?? []).filter(check => check.status !== 'healthy');
  }

  refresh(): void {
    this.actionsService.history(this.recipientId ?? undefined).subscribe({ next: rows => this.actions = rows });
    this.watchdogService.getStatus().subscribe({ next: status => this.watchdog = status });
  }

  loadRecipient(): void {
    this.error = '';
    this.success = '';
    this.selectedAction = '';
    this.recipient = null;
    if (!this.recipientId || this.recipientId < 1) return;
    this.actionsService.definitionsForRecipient(this.recipientId).subscribe({
      next: value => { this.recipient = value.recipient; this.definitions = value.definitions; this.refresh(); },
      error: response => { this.error = response?.error || 'Spedizione non trovata.'; this.definitions = []; }
    });
  }

  execute(): void {
    this.error = '';
    this.success = '';
    if (!this.recipientId || !this.selectedAction) {
      this.error = 'Inserisci l’ID della spedizione e seleziona la funzione.';
      return;
    }
    this.confirmingAction = true;
  }

  get pendingActionLabel(): string {
    return this.definitions.find(x => x.action === this.selectedAction)?.label ?? 'Esegui funzione Poste';
  }

  cancelConfirmation(): void {
    this.confirmingAction = false;
  }

  openResponse(action: PosteManualAction): void {
    this.selectedResponse = action;
  }

  closeResponse(): void {
    this.selectedResponse = null;
  }

  confirmExecute(): void {
    if (!this.recipientId || !this.selectedAction || this.submitting) return;
    this.confirmingAction = false;

    this.submitting = true;
    this.actionsService.execute(this.recipientId, this.selectedAction).subscribe({
      next: action => {
        this.actions = [action, ...this.actions.filter(x => x.id !== action.id)];
        this.success = action.status === 'completed' ? 'Risposta Poste acquisita.' : 'Comando registrato e inviato alla coda della sola spedizione.';
        this.submitting = false;
        this.refresh();
      },
      error: response => {
        this.error = response?.error?.title || response?.error || 'Comando non eseguito.';
        this.submitting = false;
      }
    });
  }

  statusLabel(status: string): string {
    return ({ queued: 'In coda', running: 'In esecuzione', completed: 'Completata', failed: 'Errore' } as Record<string, string>)[status] ?? status;
  }

  pretty(value?: string | null): string {
    if (!value) return '—';
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
  }

  print(action: PosteManualAction): void {
    const popup = window.open('', '_blank', 'width=900,height=720');
    if (!popup) return;
    const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    popup.document.write(`<!doctype html><html><head><title>Risposta Poste ${action.recipientId}</title><style>body{font:13px Arial;color:#26384b;padding:28px}h1{font-size:20px}h2{font-size:14px;margin-top:28px}pre{white-space:pre-wrap;background:#f5f8fb;border-left:3px solid #1e527f;padding:14px}</style></head><body><h1>EasySender · risposta Poste</h1><p><b>Spedizione:</b> ${action.recipientId}<br><b>Prodotto:</b> ${esc(action.product)}<br><b>Funzione:</b> ${esc(action.action)}<br><b>Esito:</b> ${esc(this.statusLabel(action.status))}</p><h2>Richiesta</h2><pre>${esc(this.pretty(action.requestPayload))}</pre><h2>Risposta</h2><pre>${esc(this.pretty(action.responsePayload || action.error))}</pre></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }
}
