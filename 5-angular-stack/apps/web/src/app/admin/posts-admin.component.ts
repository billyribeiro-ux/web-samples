import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../environments/environment';

type PostRow = { title: string; slug: string; status: string };
type Author = { id: string; name: string };

@Component({
  selector: 'app-posts-admin',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">Posts</h1>
      <button mat-raised-button color="primary" type="button" (click)="toggleForm()">
        {{ showForm() ? 'Cancel' : 'New post' }}
      </button>
    </div>

    @if (showForm()) {
      <form class="mt-6 max-w-xl space-y-4 rounded border border-slate-200 bg-white p-4" [formGroup]="form" (ngSubmit)="create()">
        <mat-form-field class="w-full">
          <mat-label>Slug</mat-label>
          <input matInput formControlName="slug" />
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Author</mat-label>
          <mat-select formControlName="authorId">
            @for (a of authors(); track a.id) {
              <mat-option [value]="a.id">{{ a.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Body (HTML)</mat-label>
          <textarea matInput rows="6" formControlName="body"></textarea>
        </mat-form-field>
        @if (formMsg()) {
          <p class="text-sm text-slate-700">{{ formMsg() }}</p>
        }
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
          Create draft
        </button>
      </form>
    }

    <table mat-table [dataSource]="rows()" class="mat-elevation-z1 mt-8 w-full">
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let r">{{ r.title }}</td>
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
export class PostsAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  readonly rows = signal<PostRow[]>([]);
  readonly authors = signal<Author[]>([]);
  readonly cols = ['title', 'slug', 'status'];
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    slug: ['', Validators.required],
    title: ['', Validators.required],
    authorId: ['', Validators.required],
    body: ['', Validators.required],
  });

  ngOnInit() {
    this.load();
    this.http.get<Author[]>(`${environment.apiUrl}/authors`).subscribe((a) => this.authors.set(a));
  }

  load() {
    this.http
      .get<PostRow[]>(`${environment.apiUrl}/posts/admin/list`)
      .subscribe((r) => this.rows.set(r));
  }

  toggleForm() {
    this.showForm.update((v) => !v);
    this.formMsg.set(null);
  }

  create() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formMsg.set(null);
    this.http.post(`${environment.apiUrl}/posts/admin`, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.formMsg.set('Created.');
        this.form.reset({ slug: '', title: '', authorId: '', body: '' });
        this.load();
        this.showForm.set(false);
      },
      error: (e) => {
        this.saving.set(false);
        this.formMsg.set(e?.error?.message ?? 'Failed to create post.');
      },
    });
  }
}
