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
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule, NgIf],
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
    return [...(this.data.historicRecipientStatuses ?? [])]
      .sort((a, b) => new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime());
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
