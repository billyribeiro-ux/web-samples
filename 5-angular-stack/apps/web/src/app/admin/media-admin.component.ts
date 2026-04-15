import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-media-admin',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <h1 class="text-2xl font-bold">Media library</h1>
    <p class="text-sm text-slate-600">Upload flow: presign → PUT to S3 → finalize (see API).</p>
    <table mat-table [dataSource]="rows()" class="mat-elevation-z1 mt-4 w-full">
      <ng-container matColumnDef="url">
        <th mat-header-cell *matHeaderCellDef>URL</th>
        <td mat-cell *matCellDef="let r">
          <a [href]="r.url" target="_blank" rel="noreferrer" class="text-brand-700">{{ r.key }}</a>
        </td>
      </ng-container>
      <ng-container matColumnDef="mimeType">
        <th mat-header-cell *matHeaderCellDef>Type</th>
        <td mat-cell *matCellDef="let r">{{ r.mimeType }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
})
export class MediaAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly rows = signal<{ key: string; url: string; mimeType: string }[]>([]);
  readonly cols = ['url', 'mimeType'];

  ngOnInit() {
    this.http
      .get<{ key: string; url: string; mimeType: string }[]>(`${environment.apiUrl}/media/library`)
      .subscribe((r) => this.rows.set(r));
  }
}
