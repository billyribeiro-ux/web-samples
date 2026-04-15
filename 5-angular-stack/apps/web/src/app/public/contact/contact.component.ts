import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="mx-auto max-w-lg px-4 py-12">
      <h1 class="text-3xl font-bold">Contact</h1>
      <form class="relative mt-8 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <!-- Honeypot: leave hidden; bots often fill this. -->
        <input
          class="absolute -left-[9999px] h-px w-px opacity-0"
          tabindex="-1"
          type="text"
          formControlName="website"
          autocomplete="off"
          aria-hidden="true"
        />
        <mat-form-field class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Message</mat-label>
          <textarea matInput rows="4" formControlName="message"></textarea>
        </mat-form-field>
        @if (status()) {
          <p class="text-sm" [class.text-green-700]="ok()" [class.text-red-700]="!ok()">
            {{ status() }}
          </p>
        }
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || sending()">
          Send
        </button>
      </form>
    </div>
  `,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
    website: [''],
  });
  readonly status = signal<string | null>(null);
  readonly ok = signal(false);
  readonly sending = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.http.post(`${environment.apiUrl}/forms/contact`, this.form.getRawValue()).subscribe({
      next: () => {
        this.ok.set(true);
        this.status.set('Thanks — we will get back to you shortly.');
        this.sending.set(false);
        this.form.reset();
      },
      error: () => {
        this.ok.set(false);
        this.status.set('Something went wrong. Please try again.');
        this.sending.set(false);
      },
    });
  }
}
