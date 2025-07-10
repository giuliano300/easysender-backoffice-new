import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../services/utils.service';
import { Sends } from '../../interfaces/Sends';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, NgIf],
  templateUrl: './send-dialog.component.html',
  styleUrl: './send-dialog.component.scss'
})
export class SendDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utils: UtilsService
  ) {}


  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

  getRecipientHtml(element: any): string {
    const name = "<span class='primary-color-span'>" + this.utils.capitalizeFirstLetter(element.recipient || '') + "</span>";
    return `${name}`;
  }


  downloadFile(element: Sends, type: string) {
    const encoder = new TextEncoder();
    let file = element.attacchedFile;
    if(type == "fileConvertito")
      file = encoder.encode(element.pathFile);
    
  if (!file || !file) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${file}`;
    link.download = element.fileName;
    link.click();
  }

}
