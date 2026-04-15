import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forms-admin',
  standalone: true,
  imports: [MatTableModule, DatePipe],
  template: `
    <h1 class="text-2xl font-bold">Form submissions</h1>
    <table mat-table [dataSource]="rows()" class="mat-elevation-z1 mt-4 w-full">
      <ng-container matColumnDef="type">
        <th mat-header-cell *matHeaderCellDef>Type</th>
        <td mat-cell *matCellDef="let r">{{ r.type }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let r">{{ r.email }}</td>
      </ng-container>
      <ng-container matColumnDef="createdAt">
        <th mat-header-cell *matHeaderCellDef>When</th>
        <td mat-cell *matCellDef="let r">{{ r.createdAt | date: 'short' }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
})
export class FormsAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly rows = signal<{ type: string; email: string | null; createdAt: string }[]>([]);
  readonly cols = ['type', 'email', 'createdAt'];

  ngOnInit() {
    this.http
      .get<{ type: string; email: string | null; createdAt: string }[]>(
        `${environment.apiUrl}/forms/admin/list`,
      )
      .subscribe((r) => this.rows.set(r));
  }
}
