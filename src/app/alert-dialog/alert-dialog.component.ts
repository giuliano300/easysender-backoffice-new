import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
  standalone:true,
  imports: [MatDialogModule]
})
export class alertDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<alertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }
}
