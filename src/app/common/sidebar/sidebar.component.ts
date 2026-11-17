import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ToggleService } from '../header/toggle.service';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    imports: [NgScrollbarModule, RouterLinkActive, RouterModule, RouterLink, NgClass, FeathericonsModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

    loginName = '';

    constructor(
        private toggleService: ToggleService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
        this.authService.loginName$.subscribe(value => {
            this.loginName = value || (localStorage.getItem('loginName')?.replace(/^"|"$/g, '')) || 'Amministratore';
        });
    }

    // Toggle Service
    isToggled = false;
    toggle() {
        this.toggleService.toggle();
    }

    logout(){
        localStorage.removeItem('authToken');
        this.authService.clearRoles();
        this.router.navigate(['/authentication']);
    }


}
