import { Component, Inject, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { Data } from '../../../interfaces/OpenApiResponse/Data';
import { UsersService } from '../../../services/users.service';
import { Responses } from '../../../interfaces/Responses';
import { OpenApiVatReponses } from '../../../interfaces/OpenApiResponse/OpenApiVatReponses';
import { FncUtils } from '../../../fncUtils/fncUtils';
import { Form1 } from '../../../interfaces/UserRegistration/form1';
import { Form2 } from '../../../interfaces/UserRegistration/form2';
import { Form3 } from '../../../interfaces/UserRegistration/form3';
import { MatSelectModule } from '@angular/material/select';
import { Form4 } from '../../../interfaces/UserRegistration/form4';
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
            mobile: ['']
         });
 
         this.form2 = this.fb.group({
            usernamePoste: ['', [Validators.required]],
            passwordPoste: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });

         this.form3 = this.fb.group({
            molContractCode: [''],
            colContractCode: [''],
            volContractCode: [''],
            agolContractCode: ['']
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
                this.form1.patchValue({
                    vatNumber: res.user.vatNumber,
                    businessName: res.user.businessName,
                    address: res.user.address,
                    zipCode: res.user.zipCode,
                    city: res.user.city,
                    pec: res.user.pec, 
                    mobile: res.user.mobile
                });             
                this.form2.patchValue({
                    usernamePoste: res.user.usernamePoste,
                    passwordPoste: res.user.passwordPoste,
                    email: res.user.email,
                    password: res.user.password
                });    
                this.usrPoste = res.user.usernamePoste;
                this.pwdPoste = res.user.passwordPoste;         
                this.form3.patchValue({
                    molContractCode: res.products.find(a => a.type === ProductTypes.mol)?.code ?? '',
                    colContractCode: res.products.find(a => a.type === ProductTypes.col)?.code ?? '',
                    volContractCode: res.products.find(a => a.type === ProductTypes.vol)?.code ?? '',
                    agolContractCode: res.products.find(a => a.type === ProductTypes.agol)?.code ?? ''                
                });             
                const gedOption = res.options.find(a => a.optionId === Options.GedPoste);
                const gedData = gedOption ? JSON.parse(gedOption.data) as Record<string, any> : undefined;                
                this.form4.patchValue({
                    hidePrice: res.options.find(a => a.optionId === Options.hidePrice) ? '1' : '0',
                    rr: res.options.find(a => a.optionId === Options.rr) ? '1' : '0',
                    ged: res.options.find(a => a.optionId === Options.Ged) || res.options.find(a => a.optionId === Options.GedPoste) ? '1' : '0',
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
            const formValues: Form1 = this.form1.value as Form1;    
            localStorage.setItem('form1', JSON.stringify(formValues));
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
            const formValues: Form2 = {
                usernamePoste: this.usrPoste!,
                passwordPoste: this.pwdPoste!,
                email: this.form2.value.email,
                password: this.form2.value.password
            };            
            localStorage.setItem('form2', JSON.stringify(formValues));
            this.isValidForm2 = true;
        }
    }

    saveForm3(){
        if (this.form3.valid) {
            const formValues: Form3 = {
                molContractCode: this.form3.value.molContractCode!,
                colContractCode: this.form3.value.colContractCode!,
                volContractCode: this.form3.value.volContractCode!,
                agolContractCode: this.form3.value.agolContractCode!
            };            
            localStorage.setItem('form3', JSON.stringify(formValues));
            this.isValidForm3 = true;
        }
    }

    saveForm4(){
        if (this.form4.valid) {
            const formValues: Form4 = {
                hidePrice: this.form4.value.hidePrice!,
                rr: this.form4.value.rr!,
                ged: this.form4.value.ged!,
                usernamePosteGed: this.form4.value.usernamePosteGed,
                passwordPosteGed: this.form4.value.passwordPosteGed
            };            
            localStorage.setItem('form4', JSON.stringify(formValues));
            this.isValidForm4 = true;

            this.sendUser();
        }
    }

    sendUser(){
        if(this.isValidForm1 && this.isValidForm2 && this.isValidForm3 && this.isValidForm4)
        {
            var form1 = JSON.parse(localStorage.getItem("form1")!);
            var form2 = JSON.parse(localStorage.getItem("form2")!);
            var form3 = JSON.parse(localStorage.getItem("form3")!);
            var form4 = JSON.parse(localStorage.getItem("form4")!);
            var u: CompleteUserRegistration = {
                ...form1,
                ...form2,
                ...form3,
                ...form4
            };        
            if(!this.id)
                this.userService.setUser(u)
                    .subscribe((data: number) => {                    
                        this.router.navigate(['/users']);
                });
            else{
                u.id = parseInt(this.id!);
                this.userService.updateUser(u)
                    .subscribe((data: number) => {                    
                        this.router.navigate(['/users']);
                });
            }
        }
        else
        {
            console.log("errore nel salvataggio");
        }
    }

}