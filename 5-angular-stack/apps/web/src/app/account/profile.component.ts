import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1 class="text-2xl font-bold">Profile</h1>
    <form class="mt-6 max-w-md space-y-4" [formGroup]="form" (ngSubmit)="save()">
      <mat-form-field class="w-full">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      @if (msg()) {
        <p class="text-sm text-green-700">{{ msg() }}</p>
      }
      <button mat-raised-button color="primary" type="submit">Save</button>
    </form>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly form = this.fb.nonNullable.group({ name: [''] });
  readonly msg = signal<string | null>(null);

  ngOnInit() {
    this.http
      .get<{ name: string | null }>(`${environment.apiUrl}/users/me`)
      .subscribe((u) => this.form.patchValue({ name: u.name ?? '' }));
  }

  save() {
    this.http
      .patch(`${environment.apiUrl}/users/me`, { name: this.form.value.name })
      .subscribe(() => this.msg.set('Saved.'));
  }
}
