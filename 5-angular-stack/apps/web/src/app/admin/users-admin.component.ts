import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <h1 class="text-2xl font-bold">Users</h1>
    <table mat-table [dataSource]="rows()" class="mat-elevation-z1 mt-4 w-full">
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let r">{{ r.email }}</td>
      </ng-container>
      <ng-container matColumnDef="roles">
        <th mat-header-cell *matHeaderCellDef>Roles</th>
        <td mat-cell *matCellDef="let r">{{ formatRoles(r) }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
})
export class UsersAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly rows = signal<{ email: string; roles: { role: { slug: string } }[] }[]>([]);
  readonly cols = ['email', 'roles'];

  ngOnInit() {
    this.http
      .get<{ email: string; roles: { role: { slug: string } }[] }[]>(`${environment.apiUrl}/users`)
      .subscribe((r) => this.rows.set(r));
  }

  formatRoles(r: { roles?: { role: { slug: string } }[] }) {
    return r.roles?.map((x) => x.role.slug).join(', ') ?? '';
  }
}
