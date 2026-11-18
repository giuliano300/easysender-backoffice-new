import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DisasterRecoveryDeleteDialogData {
  id: number;
  backupFile?: string | null;
}

@Component({
  standalone: true,
  selector: 'app-disaster-recovery-delete-dialog',
  imports: [NgIf, MatDialogModule, MatButtonModule],
  templateUrl: './disaster-recovery-delete-dialog.component.html',
  styleUrl: './disaster-recovery-delete-dialog.component.scss'
})
export class DisasterRecoveryDeleteDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: DisasterRecoveryDeleteDialogData,
    private readonly dialogRef: MatDialogRef<DisasterRecoveryDeleteDialogComponent>
  ) {}

  cancel(): void { this.dialogRef.close(false); }
  confirm(): void { this.dialogRef.close(true); }
}
