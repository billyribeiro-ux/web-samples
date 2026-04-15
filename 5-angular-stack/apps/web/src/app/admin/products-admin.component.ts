import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <h1 class="text-2xl font-bold">Products</h1>
    <table mat-table [dataSource]="rows()" class="mat-elevation-z1 mt-4 w-full">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let r">{{ r.name }}</td>
      </ng-container>
      <ng-container matColumnDef="slug">
        <th mat-header-cell *matHeaderCellDef>Slug</th>
        <td mat-cell *matCellDef="let r">{{ r.slug }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let r">{{ r.status }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
})
export class ProductsAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly rows = signal<{ name: string; slug: string; status: string }[]>([]);
  readonly cols = ['name', 'slug', 'status'];

  ngOnInit() {
    this.http
      .get<{ name: string; slug: string; status: string }[]>(`${environment.apiUrl}/products/admin/list`)
      .subscribe((r) => this.rows.set(r));
  }
}
