import { Component } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Login } from '../../interfaces/Login';
import { UtilsService } from '../../services/utils.service';
import { AuthResponse } from '../../interfaces/AuthResponse';
import { AdministratorService } from '../../services/administrators.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
    selector: 'app-sign-in',
    imports: [MatButton, MatIconButton, FormsModule, MatFormFieldModule, MatInputModule, FeathericonsModule, MatCheckboxModule, ReactiveFormsModule, NgIf, MatProgressSpinnerModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private utilsService: UtilsService,
        private administratorService: AdministratorService
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(4)]],
        });
    }
    
    isError: boolean = false;

    // Password Hide
    hide = true;
    
    sendLogin: boolean = false;

    // Form
    authForm: FormGroup;
    onSubmit() {
        this.isError = false;
        if (this.authForm.valid) {

            this.sendLogin = true;

            let login: Login = {
                "email": this.authForm.value["email"],
                "pwd" : this.authForm.value["password"]
            };

            this.administratorService.login(login).subscribe({
                next: (data: AuthResponse) => {
                    localStorage.setItem('loginName', data!.administator.username);
                    localStorage.setItem('authToken', this.utilsService.generateToken());
                    this.authService.setLoginName(data!.administator.username);
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    if (error.status === 404) 
                        this.isError = true;

                    this.sendLogin = false;
                }
            });

        } else 
        {
            console.log('Form is invalid. Please check the fields.');
        }
    }

}