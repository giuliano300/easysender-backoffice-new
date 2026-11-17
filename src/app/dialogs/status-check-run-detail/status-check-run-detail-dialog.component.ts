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

  close(): void {
    this.dialogRef.close();
  }
}
