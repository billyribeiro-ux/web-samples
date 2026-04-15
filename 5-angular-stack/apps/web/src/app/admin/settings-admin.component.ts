import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h1 class="text-2xl font-bold">Site settings</h1>
    <pre class="mt-4 overflow-auto rounded bg-slate-100 p-4 text-sm">{{ site() | json }}</pre>
  `,
})
export class SettingsAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly site = signal<unknown>(null);

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/settings/site`).subscribe((s) => this.site.set(s));
  }
}
