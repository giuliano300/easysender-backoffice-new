import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../../services/utils.service';
import { Sends } from '../../interfaces/Sends';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { RecipientService } from '../../services/recipient.service';
import { UpdateRecipient } from '../../interfaces/UpdateRecipient';

@Component({
  selector: 'app-send-dialog',
  imports: [MatDialogModule, NgIf, NgFor, MatFormField, MatCard, MatCardContent, FeathericonsModule, 
    MatLabel,ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './send-update-dialog.component.html',
  styleUrl: './send-update-dialog.component.scss'
})
export class SendUpdateDialogComponent {
  
  form!: FormGroup;

  selectedFile: File | null = null;

  attachedFile?: string | null;

  fieldLabels: { [key: string]: string } = {
    zipCodeSender: 'CAP',
    citySender: 'Città',
    stateSender: 'Stato',
    zipCodeSenderAR: 'CAP',
    citySenderAR: 'Città',
    stateSenderAR: 'Stato',
    zipCode: 'CAP',
    city: 'Città',
    state: 'Stato'
  };

  fieldIcons: { [key: string]: string } = {
    zipCodeSender: 'code',
    citySender: 'map-pin',
    stateSender: 'flag',    
    zipCodeSenderAR: 'code',
    citySenderAR: 'map-pin',
    stateSenderAR: 'flag',
    zipCode: 'code',
    city: 'map-pin',
    state: 'flag'

  };  

  constructor(
    public dialogRef: MatDialogRef<SendUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utils: UtilsService,
    private fb: FormBuilder,
    private recipientService: RecipientService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [{value: this.data?.id || '',  disabled: true}],
      insertDate: [{value: this.data?.insertDate || '',  disabled: true}],
      userComplete: [{value: this.data?.userComplete || '',  disabled: true}],
      senderComplete: [{value: this.data?.senderComplete || '',  disabled: true}],
      recipient: [this.data?.recipient || '', Validators.required],
      codice: [this.data?.codice || ''],
      requestId: [{value: this.data?.requestId || '',  disabled: true}],
      currentState: [{value: this.data?.currentState || '',  disabled: true}],
      stato: [{value: this.data?.stato || '',  disabled: true}],

      sender: [this.data?.sender || '', Validators.required],
      complementNameSender: [this.data?.complementNameSender || ''],
      complementAddressSender: [this.data?.complementAddressSender || ''],
      addressSender: [this.data?.addressSender || '', Validators.required],
      zipCodeSender: [this.data?.zipCodeSender || '', Validators.required],
      citySender: [this.data?.citySender || '', Validators.required],
      stateSender: [this.data?.stateSender || '', Validators.required],

      senderAR: [this.data?.senderAR || ''],
      addressSenderAR: [this.data?.addressSenderAR || ''],
      complementNameSenderAR: [this.data?.complementNameSenderAR || ''],
      complementAddressSenderAR: [this.data?.complementAddressSenderAR || ''],
      zipCodeSenderAR: [this.data?.zipCodeSenderAR || ''],
      citySenderAR: [this.data?.citySenderAR || ''],
      stateSenderAR: [this.data?.stateSenderAR || ''],

      complementName: [this.data?.complementName || ''],
      address: [this.data?.address || '', Validators.required],
      complementAddress: [this.data?.complementAddress || ''],
      zipCode: [this.data?.zipCode || '', Validators.required],
      city: [this.data?.city || '', Validators.required],
      state: [this.data?.state || '', Validators.required],
      fileName: [{value: this.data?.fileName || '',  disabled: true}]
    });

    this.attachedFile = this.data.attacchedFile;
  }

  onCancel(): void {
    this.dialogRef.close(false); // L'utente ha annullato
  }

  onSave(){
    if (this.form.invalid) {
        console.warn('Form non valido', this.form.errors);
        this.form.markAllAsTouched(); // evidenzia gli errori nei campi
        return;
      }

    // Estrarre i valori del form e mappare sull’interfaccia
      const raw = this.form.getRawValue();
      const recipientUpdate: UpdateRecipient = {
        id: raw.id,
        recipient: raw.recipient,

        sender: raw.sender,
        complementNameSender: raw.complementNameSender,
        addressSender: raw.addressSender,
        complementAddressSender: raw.complementAddressSender,
        zipCodeSender: raw.zipCodeSender,
        citySender: raw.citySender,
        stateSender: raw.stateSender,

        senderAR: raw.senderAR,
        complementNameSenderAR: raw.complementNameSenderAR,
        addressSenderAR: raw.addressSenderAR,
        complementAddressSenderAR: raw.complementAddressSenderAR,
        zipCodeSenderAR: raw.zipCodeSenderAR,
        citySenderAR: raw.citySenderAR,
        stateSenderAR: raw.stateSenderAR,

        complementName: raw.complementName,
        address: raw.address,
        complementAddress: raw.complementAddress,
        zipCode: raw.zipCode,
        city: raw.city,
        state: raw.state,
        fileName: raw.fileName,
        attachedFile: this.attachedFile!
      };

      // Qui chiami la tua API per salvare
      this.recipientService.UpdateAndResend(recipientUpdate).subscribe({
        next: (response) => {
          console.log('Salvataggio riuscito:', response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Errore durante il salvataggio:', error);
        }
      });
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


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selezionato:', this.selectedFile);
      // Se vuoi aggiornare il form:
      // Leggi il file come base64
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // rimuove il prefisso data:mime
        // Aggiorna il form: nome file + contenuto base64
        this.form.patchValue({
          fileName: this.selectedFile!.name,
        });    
        this.attachedFile = base64String;
      }
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64); // decode base64
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }
}
