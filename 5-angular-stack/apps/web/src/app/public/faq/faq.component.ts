import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatExpansionModule],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold">FAQ</h1>
      <mat-accordion class="mt-8">
        <mat-expansion-panel>
          <mat-expansion-panel-header>What is this platform?</mat-expansion-panel-header>
          <p>A full-stack reference implementation for marketing, blog, store, and memberships.</p>
        </mat-expansion-panel>
        <mat-expansion-panel>
          <mat-expansion-panel-header>How do I sign in?</mat-expansion-panel-header>
          <p>Use Auth0 from the Log in link. Configure your tenant and SPA in environment files.</p>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
})
export class FaqComponent {}
