import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { GetDashboardStats } from '../../interfaces/GetDashboardStats';
@Component({
    selector: 'app-crm',
    imports: [MatCardModule],
    templateUrl: './crm.component.html',
    styleUrl: './crm.component.scss'
})
export class CrmComponent {
    constructor(
        private router: Router,
        private dashboardService: DashboardService
    ) {}

  g: GetDashboardStats | null = null;

  intervalId: any;

  ngOnInit(): void {
    this.getDashboard(); // chiamata iniziale subito
    this.intervalId = setInterval(() => {
      this.getDashboard();
    }, 5000); // ogni 5 secondi
  }

  ngOnDestroy(): void {
    // Pulisci l'intervallo quando il componente viene distrutto
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getDashboard() {
    this.dashboardService.getDashboard().subscribe({
      next: (data: GetDashboardStats[]) => {
          this.g = data[0];
      },
      error: (error) => {
        if (error.status === 404) {
          console.log(error);
        }
      }
    });
  }



}