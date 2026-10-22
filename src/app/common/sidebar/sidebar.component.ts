import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ToggleService } from '../header/toggle.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    imports: [NgScrollbarModule, MatExpansionModule, RouterLinkActive, RouterModule, RouterLink, NgClass, FeathericonsModule],
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

    // Mat Expansion
    panelOpenState = false;

    openUsersMenuFromCompactSidebar() {
        // Nella sidebar desktop compatta il contenuto del pannello non è visibile:
        // prima la estendiamo, poi Material apre normalmente il sottomenu.
        if (typeof window !== 'undefined' && window.innerWidth > 1199 && this.isToggled) {
            this.toggleService.expandDesktopSidebar();
        }
    }

    logout(){
        localStorage.removeItem('authToken');
        this.authService.clearRoles();
        this.router.navigate(['/authentication']);
    }


}
