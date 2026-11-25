import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusCheckDailyRun, StatusCheckRunDetails } from '../../interfaces/status-check-daily';
import { StatusCheckDailyService } from '../../services/status-check-daily.service';

@Component({
  selector: 'app-status-check-run-detail-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, MatDialogModule, MatButtonModule],
  templateUrl: './status-check-run-detail-dialog.component.html',
  styleUrl: './status-check-run-detail-dialog.component.scss'
})
export class StatusCheckRunDetailDialogComponent implements OnInit {
  details?: StatusCheckRunDetails;
  loadingShipments = true;
  shipmentError = '';
  retrying = false;
  retryMessage = '';
  retryError = '';
  retrySucceeded = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly run: StatusCheckDailyRun,
    private readonly dialogRef: MatDialogRef<StatusCheckRunDetailDialogComponent>,
    private readonly api: StatusCheckDailyService
  ) {}

  ngOnInit(): void {
    this.api.getDetails(this.run.id).subscribe({
      next: details => { this.details = details; this.loadingShipments = false; },
      error: () => { this.loadingShipments = false; this.shipmentError = 'Il dettaglio delle spedizioni non è disponibile.'; }
    });
  }

  get outcomeLabel(): string {
    return this.run.outcome === 'completed' ? 'Completata' : this.run.outcome === 'no_outcomes' ? 'Nessun esito' : 'Non riuscita';
  }

  get outcomeExplanation(): string | null {
    if (this.run.outcome === 'no_outcomes') {
      return 'Poste ha risposto alla richiesta, ma non ha restituito alcuna rendicontazione per le spedizioni del batch. Nessuno stato è stato modificato.';
    }
    if (this.run.outcome === 'failed') {
      return 'Il batch non è stato completato. Il messaggio tecnico completo è riportato qui sotto.';
    }
    return null;
  }

  close(): void {
    this.dialogRef.close(this.retrySucceeded);
  }

  get canRetry(): boolean {
    return this.run.outcome === 'no_outcomes' || this.run.outcome === 'failed';
  }

  retry(): void {
    if (!this.canRetry || this.retrying || this.retrySucceeded) return;
    this.retrying = true;
    this.retryMessage = '';
    this.retryError = '';
    this.api.retry(this.run.id).subscribe({
      next: result => {
        this.retrying = false;
        if (!result.queuedRecipients) {
          this.retryError = `Nessuna spedizione disponibile per il controllo. Escluse ${result.excludedFinalRecipients} già in stato finale.`;
          return;
        }
        this.retrySucceeded = true;
        this.retryMessage = `${result.queuedRecipients} spedizioni abilitate a un nuovo controllo.${result.excludedFinalRecipients ? ` ${result.excludedFinalRecipients} già finali escluse.` : ''} ${result.manualRunRequested ? 'Richiesto un nuovo ciclo: verifica il risultato in un nuovo batch.' : 'Il ciclo manuale non è configurato: il controllo dipende dalla pianificazione.'} L’esito precedente resta nello storico.`;
      },
      error: error => {
        this.retrying = false;
        this.retryError = error?.error?.message || 'Non è stato possibile reinviare il batch al controllo stati.';
      }
    });
  }
}
