import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { StatusCheckDaily, StatusCheckDailyRun } from '../../interfaces/status-check-daily';
import { StatusCheckDailyService } from '../../services/status-check-daily.service';
import { MatTableDataSource } from '@angular/material/table';
import { StatusCheckRunDetailDialogComponent } from '../../dialogs/status-check-run-detail/status-check-run-detail-dialog.component';

@Component({
  standalone: true,
  selector: 'app-status-check-daily',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatDialogModule, DatePipe, RouterLink],
  templateUrl: './status-check-daily.component.html',
  styleUrl: './status-check-daily.component.scss'
})
export class StatusCheckDailyComponent implements OnInit, OnDestroy {
  readonly productColumns = ['product', 'batches', 'requested', 'changed', 'finalStates', 'duplicates', 'noOutcomes', 'failed'];
  readonly runColumns = ['startedAt', 'product', 'userName', 'requestedCount', 'returnedCount', 'statusChangedCount', 'finalStateCount', 'outcome'];
  data?: StatusCheckDaily;
  readonly runDataSource = new MatTableDataSource<StatusCheckDailyRun>([]);
  loading = true;
  error = '';
  selectedDate = this.toInputDate(new Date());
  private refreshTimer?: ReturnType<typeof setInterval>;

  @ViewChild(MatPaginator)
  set paginator(value: MatPaginator | undefined) {
    if (value) this.runDataSource.paginator = value;
  }

  constructor(private readonly api: StatusCheckDailyService, private readonly dialog: MatDialog) {}
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
    this.api.get(this.selectedDate).subscribe({
      next: value => { this.data = value; this.runDataSource.data = value.runs; this.loading = false; },
      error: () => {
        this.loading = false;
        if (!silent) this.error = 'Impossibile leggere il riepilogo. Verificare che lo script SQL e le automazioni aggiornate siano pubblicati.';
      }
    });
  }

  outcomeLabel(run: StatusCheckDailyRun): string {
    return run.outcome === 'completed' ? 'Completata' : run.outcome === 'no_outcomes' ? 'Nessun esito' : 'Non riuscita';
  }

  openRunDetail(run: StatusCheckDailyRun): void {
    this.dialog.open(StatusCheckRunDetailDialogComponent, {
      data: run,
      width: '670px',
      maxWidth: 'calc(100vw - 28px)',
      panelClass: 'status-run-detail-dialog',
      autoFocus: false
    });
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
