import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../services/utils.service';
import { GetDettaglioDestinatario } from '../../interfaces/GetDettaglioDestinatario';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule, MatTooltipModule, NgIf],
  templateUrl: './historic-recipient-status-dialog.component.html',
  styleUrl: './historic-recipient-status-dialog.component.scss'
})
export class HistoricRecipientStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HistoricRecipientStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GetDettaglioDestinatario,
    public utils: UtilsService
  ) {}

  displayedColumns: string[] = ['insertDate', 'message'];

  get sortedStatuses() {
    const statuses = [...(this.data.historicRecipientStatuses ?? [])]
      .sort((a, b) => new Date(b.outcomeDate || b.insertDate).getTime() - new Date(a.outcomeDate || a.insertDate).getTime() || new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime());
    const index = statuses.findIndex(item => this.isFinalStatus(item));
    if (index > 0) statuses.unshift(...statuses.splice(index, 1));
    return statuses;
  }

  isFinalStatus(item: { code?: string | null; message?: string | null; objectType?: string | null }): boolean {
    const recipient = this.data.recipient;
    return recipient.finalState === true && recipient.finalStateReason !== 'expired_90_days'
      && !!item.code && item.code === recipient.statoMarker && item.message === recipient.message
      && (![6, 9].includes(recipient.productType) || item.objectType === 'AG');
  }

  formatDateTime(value: string): string {
    if (!value) return 'Data non disponibile';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this.utils.getDateTimeFormatted(value) || 'Data non disponibile';

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Rome'
    }).format(date);
  }

  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

}
