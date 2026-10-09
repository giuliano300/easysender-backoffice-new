import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { Data } from '../../../interfaces/OpenApiResponse/Data';
import { UsersService } from '../../../services/users.service';
import { Responses } from '../../../interfaces/Responses';
import { OpenApiVatReponses } from '../../../interfaces/OpenApiResponse/OpenApiVatReponses';
import { FncUtils } from '../../../fncUtils/fncUtils';
import { MatSelectModule } from '@angular/material/select';
import { CompleteUserRegistration } from '../../../interfaces/UserRegistration/completeUserRegistration';
import { ActivatedRoute, Router } from '@angular/router';
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { Options, ProductTypes } from '../../../interfaces/enum';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [ 
        MatButtonModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FeathericonsModule,
        MatCardModule,
        NgIf,
        CommonModule,
        MatOption,
        MatSelectModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {

    form1: FormGroup;
    form2: FormGroup;
    form3: FormGroup;
    form4: FormGroup;
    vatNumber: string | undefined;
    checkingVat: boolean = false;
    ctrlVat: boolean = false;
    ctrlPosteaccesses: boolean = false;
    accessNotValid: boolean = false;
    accessValid: boolean = false;
    errorMessage: string | null = null;
    errorMessageExistVatNumber: string | null = null;
    checkVatNumberValid: string | null = null;
    openApiResponsesData: Data[] = [];
    password = '';
    usrPoste: string | null = '';
    pwdPoste: string | null = '';
    showStrength = true;
    FncUtils = FncUtils;

    isValidForm1 = false;
    isValidForm2 = false;
    isValidForm3 = false;
    isValidForm4 = false;

    update = false;

    id?: string;

    label: string = "Aggiungi utente";

   @ViewChild('content') content: TemplateRef<any> | undefined;

   constructor(
        private fb: FormBuilder,
        private userService: UsersService,
        private router: Router,
        private route: ActivatedRoute
    ) {
         this.form1 = this.fb.group({
            vatNumber: ['', Validators.required],
            businessName: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            zipCode: ['', Validators.required],
            pec: ['', Validators.required],
            mobile: [''],
            contractStartDate: [''],
            contractEndDate: [''],
            doubleFactor: [null, Validators.required]
         }, { validators: this.contractDateRangeValidator });
 
         this.form2 = this.fb.group({
            usernamePoste: ['', [Validators.required]],
            passwordPoste: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            usernameOldSite: [''],
            passwordOldSite: ['']
        });

         this.form3 = this.fb.group({
            molContractCode: [''],
            col1ContractCode: [''],
            col4ContractCode: [''],
            volContractCode: [''],
            agolBContractCode: [''],
            agolMContractCode: ['']
        });

         this.form4 = this.fb.group({
            hidePrice: [''],
            rr: [''],
            ged: [''],
            usernamePosteGed: [''],            
            passwordPosteGed: ['']
        });

    }

    goToUsers() {
        this.router.navigate(['/users']);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.id = params.get('id')!;
            if(this.id){
                this.setForms();
                this.label = "Modifica utente";
            }
        });   
    }

    setForms(){
        this.userService.getUserById(parseInt(this.id!))
            .subscribe((res: CompleteUser) => {      
                const products = res.products ?? [];
                const options = res.options ?? [];

                this.form2.get('password')?.setValidators([Validators.minLength(6)]);
                this.form2.get('password')?.updateValueAndValidity();
                this.form1.patchValue({
                    vatNumber: res.user.vatNumber,
                    businessName: res.user.businessName,
                    address: res.user.address,
                    zipCode: res.user.zipCode,
                    city: res.user.city,
                    pec: res.user.pec, 
                    mobile: res.user.mobile,
                    contractStartDate: this.toDateInputValue(res.user.contractStartDate),
                    contractEndDate: this.toDateInputValue(res.user.contractEndDate),
                    doubleFactor: res.user.doubleFactor === true ? "1" : "0"
                });             
                this.form2.patchValue({
                    usernamePoste: res.user.usernamePoste,
                    passwordPoste: res.user.passwordPoste,
                    email: res.user.email,
                    password: '',
                    usernameOldSite: res.user.usernameOldSite,
                    passwordOldSite: res.user.passwordOldSite
                });    
                this.usrPoste = res.user.usernamePoste;
                this.pwdPoste = res.user.passwordPoste;         
                this.form3.patchValue({
                    molContractCode: products.find(a => a.type === ProductTypes.mol)?.code ?? '',
                    col1ContractCode: products.find(a => a.type === ProductTypes.col1)?.code ?? '',
                    col4ContractCode: products.find(a => a.type === ProductTypes.col4)?.code ?? '',
                    volContractCode: products.find(a => a.type === ProductTypes.vol)?.code ?? '',
                    agolBContractCode: products.find(a => a.type === ProductTypes.agolB)?.code ?? '',
                    agolMContractCode: products.find(a => a.type === ProductTypes.agolM)?.code ?? ''
                });             
                const gedOption = options.find(a => a.optionId === Options.GedPoste);
                let gedData: Record<string, any> | undefined;
                if (gedOption?.data) {
                    try {
                        gedData = JSON.parse(gedOption.data) as Record<string, any>;
                    } catch {
                        gedData = undefined;
                    }
                }
                this.form4.patchValue({
                    hidePrice: options.find(a => a.optionId === Options.hidePrice) ? '1' : '0',
                    rr: options.find(a => a.optionId === Options.rr) ? '1' : '0',
                    ged: options.find(a => a.optionId === Options.Ged) || options.find(a => a.optionId === Options.GedPoste) ? '1' : '0',
                    usernamePosteGed: gedData ? gedData!["username"] : '',
                    passwordPosteGed: gedData ? gedData!["password"] : ''
                });        
                
                this.accessValid = true;
                this.update = true;
                this.isValidForm1 = true;
                this.isValidForm2 = true;
                this.isValidForm3 = true;
                this.isValidForm4 = true;
            });    
    }

    checkVatNumber(){
        const vatCtrl = this.form1.get('vatNumber');
        
        if (!vatCtrl || vatCtrl.invalid) {
            vatCtrl!.markAsTouched(); 
            return;
        }

        this.vatNumber = vatCtrl.value!;
        if (this.vatNumber === "") return;

        this.ctrlVat = true;
        this.checkVatNumberValid = null;
        this.errorMessage = null;
        this.errorMessageExistVatNumber = null;
        this.userService.existUser(this.vatNumber!)
            .subscribe((data: Responses) => {
            this.checkingVat = false;
            if(!data.valid){
                //SE NON E' GIA' REGISTRATO
                this.userService.checkVat(this.vatNumber!)
                .subscribe((data: OpenApiVatReponses) => {
                this.ctrlVat = false;
                if(data.success){
                    this.checkVatNumberValid = "Partita iva correttamente inserita.";
                    this.openApiResponsesData = data.data;
                    this.checkingVat = true;

                    this.form1.patchValue({
                        businessName: this.openApiResponsesData[0].companyName,
                        address: this.openApiResponsesData[0].address.registeredOffice.streetName,
                        zipCode: this.openApiResponsesData[0].address.registeredOffice.zipCode,
                        city: this.openApiResponsesData[0].address.registeredOffice.town,
                        pec: this.openApiResponsesData[0].pec
                    });                
                }      
                else
                {
                    this.ctrlVat = false;
                    this.errorMessageExistVatNumber = data.message + " - Puoi comunque inserire manualmente i dati dell'azienda";
                    this.form1.patchValue({
                        businessName: '',
                        address: '',
                        zipCode: '',
                        city: '',
                        pec: ''
                    });   
                }  
                });
            }      
            else
            {
                this.ctrlVat = false;
                this.errorMessageExistVatNumber = "Partita iva già presente nei nostri archivi.";
            }  
        });
    }
    
    allowOnlyNumbers(event: KeyboardEvent) {
        const charCode = event.key.charCodeAt(0);
        // Blocca tutto ciò che non è tra 0 e 9
        if (charCode < 48 || charCode > 57) {
        event.preventDefault();
        }
    }

    onPasswordInput() {
        this.password = this.form2.get('password')?.value;
    }

    getPasswordClass(): string {
        const strength = FncUtils.checkPasswordStrength(this.password);
        return `pwd pwd-${strength} sub-input`;
    }
    
    get passwordStrength(): 'debole' | 'media' | 'forte' {
        return FncUtils.checkPasswordStrength(this.password);
    }    

    saveForm1(){
        if (this.form1.valid) {
            this.isValidForm1 = true;
        }
    }

    checkPosteAccesses(){
        this.accessNotValid = false;
        this.accessValid = false;
        const usernamePoste = this.form2.get('usernamePoste');
        const passwordPoste = this.form2.get('passwordPoste');

        if (!usernamePoste || usernamePoste.invalid) {
            usernamePoste!.markAsTouched(); 
            return;
        }

        if (!passwordPoste || passwordPoste.invalid) {
            passwordPoste!.markAsTouched(); 
            return;
        }

        this.ctrlPosteaccesses = true;

        this.userService.checkPosteAccess(usernamePoste!.value!, passwordPoste!.value!)
        .subscribe((data: boolean) => {
            this.ctrlPosteaccesses = false;
            if(!data){
                this.accessNotValid = true;
            }
            else
            {
                this.accessValid = true;
                this.usrPoste = usernamePoste!.value!;
                this.pwdPoste = passwordPoste!.value!;
                usernamePoste.disable();
                passwordPoste.disable();
            }
        })
    }

    saveForm2(){
        if (this.form2.valid) {
            this.isValidForm2 = true;
        }
    }

    saveForm3(){
        if (this.form3.valid) {
            this.isValidForm3 = true;
        }
    }

    saveForm4(){
        if (this.form4.valid) {
            this.isValidForm4 = true;

            this.sendUser();
        }
    }

    sendUser(){
        if(this.isValidForm1 && this.form1.valid && this.isValidForm2 && this.isValidForm3 && this.isValidForm4)
        {
            const form1 = this.form1.getRawValue();
            const form2 = this.form2.getRawValue();
            const form3 = this.form3.getRawValue();
            const form4 = this.form4.getRawValue();
            const u: CompleteUserRegistration = {
                vatNumber: form1.vatNumber,
                businessName: form1.businessName,
                address: form1.address,
                city: form1.city,
                zipCode: form1.zipCode,
                mobile: form1.mobile ?? '',
                contractStartDate: form1.contractStartDate || null,
                contractEndDate: form1.contractEndDate || null,
                pec: form1.pec,
                doubleFactor: form1.doubleFactor,
                usernamePoste: form2.usernamePoste,
                passwordPoste: form2.passwordPoste,
                email: form2.email,
                password: form2.password ?? '',
                usernameOldSite: form2.usernameOldSite ?? '',
                passwordOldSite: form2.passwordOldSite ?? '',
                molContractCode: form3.molContractCode ?? '',
                col1ContractCode: form3.col1ContractCode ?? '',
                col4ContractCode: form3.col4ContractCode ?? '',
                volContractCode: form3.volContractCode ?? '',
                agolBContractCode: form3.agolBContractCode ?? '',
                agolMContractCode: form3.agolMContractCode ?? '',
                hidePrice: form4.hidePrice ?? '0',
                rr: form4.rr ?? '0',
                ged: form4.ged ?? '0',
                usernamePosteGed: form4.usernamePosteGed ?? '',
                passwordPosteGed: form4.passwordPosteGed ?? '',
                id: this.id ? parseInt(this.id) : 0
            };
            if(!this.id)
                this.userService.setUser(u)
                    .subscribe({
                        next: () => this.router.navigate(['/users']),
                        error: () => this.errorMessage = "Errore durante il salvataggio dell'utente. Nessun dato è stato modificato."
                    });
            else{
                this.userService.updateUser(u)
                    .subscribe({
                        next: () => this.router.navigate(['/users']),
                        error: () => this.errorMessage = "Errore durante la modifica dell'utente. Nessun dato è stato modificato."
                    });
            }
        }
        else
        {
            console.log("errore nel salvataggio");
        }
    }

    private toDateInputValue(value?: string | null): string {
        return value ? value.substring(0, 10) : '';
    }

    private contractDateRangeValidator(control: AbstractControl): ValidationErrors | null {
        const startDate = control.get('contractStartDate')?.value;
        const endDate = control.get('contractEndDate')?.value;

        return startDate && endDate && endDate < startDate
            ? { contractDateRange: true }
            : null;
    }

}
