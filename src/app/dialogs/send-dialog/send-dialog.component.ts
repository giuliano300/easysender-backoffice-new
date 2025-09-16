import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../services/utils.service';
import { Sends } from '../../interfaces/Sends';
import { NgIf } from '@angular/common';
import { RecipientService } from '../../services/recipient.service';

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
    public utils: UtilsService,
    private recipientService: RecipientService
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
    let add = "";
    if(type == "fileConvertito")
      file = encoder.encode(element.pathFile);
    if(type == "fileRA")
    {
      add = "RA-";
      file = element.attacchedFileRA;
    }
    if(type == "fileRR")
    {
      add = "RR-";
      file = element.attacchedFileRR;
    }
    
  if (!file || !file) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${file}`;
    link.download = add + element.fileName;
    link.click();
  }

  creaDocumentoFinale(send: any){
    this.recipientService.requestFinalDoc(send).subscribe({
      next: (res) => {
        send.attacchedFileRR = res.file;
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello stato:", err);
      },
      complete: () => {
        send.loading = false; 
      }
    })
  }

}
