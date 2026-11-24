import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { StatusCheckDaily, StatusCheckDailyRun, StatusCheckRunFilter, StatusRecognitionIssues } from '../../interfaces/status-check-daily';
import { StatusCheckDailyService } from '../../services/status-check-daily.service';
import { StatusCheckRunDetailDialogComponent } from '../../dialogs/status-check-run-detail/status-check-run-detail-dialog.component';
import { RecipientService } from '../../services/recipient.service';
import { HistoricRecipientStatusDialogComponent } from '../../dialogs/historic-recipient-status/historic-recipient-status-dialog.component';
import { GetDettaglioDestinatario } from '../../interfaces/GetDettaglioDestinatario';

@Component({
  standalone: true,
  selector: 'app-status-check-daily',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule, DatePipe, RouterLink],
  templateUrl: './status-check-daily.component.html',
  styleUrl: './status-check-daily.component.scss'
})
export class StatusCheckDailyComponent implements OnInit, OnDestroy {
  readonly productColumns = ['product', 'batches', 'requested', 'changed', 'finalStates', 'duplicates', 'noOutcomes', 'failed'];
  readonly runColumns = ['startedAt', 'product', 'userName', 'requestedCount', 'returnedCount', 'statusChangedCount', 'finalStateCount', 'outcome'];
  readonly staleColumns = ['product', 'code', 'requestId', 'recipientName', 'userName', 'message', 'lastStatusAt', 'maximumDays', 'elapsedDays', 'actions'];
  data?: StatusCheckDaily;
  staleData?: StatusRecognitionIssues;
  loading = true;
  error = '';
  selectedDate = this.toInputDate(new Date());
  pageIndex = 0;
  pageSize = 20;
  runFilter?: StatusCheckRunFilter;
  batchPanelOpen = true;
  stalePanelOpen = true;
  stalePageIndex = 0;
  stalePageSize = 20;
  staleLoading = false;
  staleExporting = false;
  retryingShipmentId?: number;
  staleActionMessage = '';
  staleActionError = '';
  private refreshTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly api: StatusCheckDailyService,
    private readonly dialog: MatDialog,
    private readonly recipientService: RecipientService
  ) {}
  ngOnInit(): void {
    this.load();
    this.refreshTimer = setInterval(() => this.load(true), 20000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  load(silent = false): void {
    if (!silent) {
      this.loading = true;
      this.error = '';
    }
    this.api.get(this.selectedDate, this.pageIndex, this.pageSize, this.runFilter).subscribe({
      next: value => { this.data = value; this.loading = false; this.loadStale(); },
      error: () => {
        this.loading = false;
        if (!silent) this.error = 'Impossibile leggere il riepilogo. Verificare che lo script SQL e le automazioni aggiornate siano pubblicati.';
      }
    });
  }

  onDateChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load(true);
  }

  get runTotalPages(): number {
    if (!this.data) return 1;
    return Math.max(1, Math.ceil(this.data.totalRuns / this.data.pageSize));
  }

  get runPageNumbers(): number[] {
    const current = (this.data?.pageIndex ?? 0) + 1;
    const first = Math.max(1, Math.min(current - 2, this.runTotalPages - 4));
    const last = Math.min(this.runTotalPages, first + 4);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  goToRunPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.runTotalPages) - 1;
    if (target === this.pageIndex || this.loading) return;
    this.pageIndex = target;
    this.load(true);
  }

  onStalePageChange(event: PageEvent): void {
    this.stalePageIndex = event.pageIndex;
    this.stalePageSize = event.pageSize;
    this.loadStale();
  }

  get staleTotalPages(): number {
    if (!this.staleData) return 1;
    return Math.max(1, Math.ceil(this.staleData.totalCount / this.staleData.pageSize));
  }

  get stalePageNumbers(): number[] {
    const current = (this.staleData?.pageIndex ?? 0) + 1;
    const first = Math.max(1, Math.min(current - 2, this.staleTotalPages - 4));
    const last = Math.min(this.staleTotalPages, first + 4);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  goToStalePage(page: number): void {
    const target = Math.min(Math.max(1, page), this.staleTotalPages) - 1;
    if (target === this.stalePageIndex || this.staleLoading) return;
    this.stalePageIndex = target;
    this.loadStale();
  }

  loadStale(): void {
    this.staleLoading = true;
    this.api.getStale(this.stalePageIndex, this.stalePageSize).subscribe({
      next: value => { this.staleData = value; this.staleLoading = false; },
      error: () => { this.staleLoading = false; }
    });
  }

  exportStale(): void {
    if (this.staleExporting) return;
    this.staleExporting = true;
    this.api.exportStale().subscribe({
      next: file => {
        const url = URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'spedizioni-da-inviare-a-poste.csv';
        anchor.click();
        URL.revokeObjectURL(url);
        this.staleExporting = false;
      },
      error: () => { this.staleExporting = false; }
    });
  }

  retryShipment(shipment: { id: number; product: string; canRetry: boolean }): void {
    if (!shipment.canRetry || this.retryingShipmentId) return;
    this.retryingShipmentId = shipment.id;
    this.staleActionMessage = '';
    this.staleActionError = '';
    this.recipientService.retryStatusByProduct(shipment.id, shipment.product).subscribe({
      next: response => {
        this.retryingShipmentId = undefined;
        if (response.state >= 400) {
          this.staleActionError = typeof response.message === 'string' ? response.message : 'Poste non ha accettato la richiesta di aggiornamento.';
          return;
        }
        this.staleActionMessage = 'Richiesta di aggiornamento inviata a Poste.';
        this.loadStale();
      },
      error: error => {
        this.retryingShipmentId = undefined;
        this.staleActionError = error?.error?.message || 'Impossibile contattare Poste per aggiornare lo stato.';
      }
    });
  }

  openShipmentDetail(shipment: { id: number }): void {
    this.recipientService.getDettaglioDestinatario(shipment.id).subscribe({
      next: (detail: GetDettaglioDestinatario) => this.dialog.open(HistoricRecipientStatusDialogComponent, {
        data: detail,
        width: '680px',
        maxWidth: '94vw',
        maxHeight: '90vh',
        panelClass: 'send-history-dialog',
        autoFocus: false
      })
    });
  }

  toggleRunFilter(filter: StatusCheckRunFilter): void {
    this.runFilter = this.runFilter === filter ? undefined : filter;
    this.pageIndex = 0;
    this.load(true);
  }

  clearRunFilter(): void {
    if (!this.runFilter) return;
    this.runFilter = undefined;
    this.pageIndex = 0;
    this.load(true);
  }

  outcomeLabel(run: StatusCheckDailyRun): string {
    return run.outcome === 'completed' ? 'Completata' : run.outcome === 'no_outcomes' ? 'Nessun esito' : 'Non riuscita';
  }

  openRunDetail(run: StatusCheckDailyRun): void {
    const dialogRef = this.dialog.open(StatusCheckRunDetailDialogComponent, {
      data: run,
      width: '670px',
      maxWidth: 'calc(100vw - 28px)',
      panelClass: 'status-run-detail-dialog',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(retried => { if (retried) this.load(true); });
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
