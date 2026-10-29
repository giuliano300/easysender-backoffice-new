import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../services/utils.service';
import { Sends } from '../../interfaces/Sends';
import { NgIf } from '@angular/common';
import { RecipientService } from '../../services/recipient.service';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { alertDialogComponent } from '../../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, NgIf, MatProgressSpinnerModule],
  templateUrl: './send-dialog.component.html',
  styleUrl: './send-dialog.component.scss'
})
export class SendDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utils: UtilsService,
    private recipientService: RecipientService,
    private dialog: MatDialog
 ) {}

  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

  getRecipientHtml(element: any): string {
    const name = "<span class='primary-color-span'>" + this.utils.capitalizeFirstLetter(element.recipient || '') + "</span>";
    return `${name}`;
  }

  isTelegram(): boolean {
    return this.data?.productType === 3;
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
    if(type == "acceptanceReceipt")
    {
      add = "RA-ACC-";
      file = element.attacchedFileRicevutaAccettazione ?? new Uint8Array();
    }
    
  if (!file || !file) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${file}`;
    link.download = add + element.fileName;
    link.click();
  }

  creaDocumentoFinale(send: any){
    send.loading = true;
    this.recipientService.requestFinalDoc(send).subscribe({
      
      next: (res) => {
        send.attacchedFileRA = res.file;
      },
      error: (err) => {
        const data = {
          title: "Errore nella generazione del file",
          description: err.error.message,
        }
        const dialogRef = this.dialog.open(alertDialogComponent, {
          data: data,
          width: '540px',
          maxWidth: '92vw',
          panelClass: 'alert-action-dialog'
        });
        send.loading = false; 
      },
      complete: () => {
        send.loading = false; 
      }
    })
  }

  creaRicevutaAccettazione(send: any): void {
    send.loadingAcceptanceReceipt = true;
    this.recipientService.requestAcceptanceReceipt(send).subscribe({
      next: (res) => {
        send.attacchedFileRicevutaAccettazione = res.file;
      },
      error: (err) => {
        this.dialog.open(alertDialogComponent, {
          data: {
            title: 'Errore nel recupero della ricevuta',
            description: err.error?.message || 'La ricevuta di accettazione non è ancora disponibile.'
          },
          width: '540px',
          maxWidth: '92vw',
          panelClass: 'alert-action-dialog'
        });
      },
      complete: () => {
        send.loadingAcceptanceReceipt = false;
      }
    });
  }

}
