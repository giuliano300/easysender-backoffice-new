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

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule],
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

  ngOnInit(): void {
    console.log(this.data);
  }

  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

}
