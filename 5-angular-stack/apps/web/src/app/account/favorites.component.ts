import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

type Fav = { product: { slug: string; name: string } };

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl font-bold">Favorites</h1>
    <ul class="mt-4 space-y-2">
      @for (f of favs(); track f.product.slug) {
        <li>
          <a [routerLink]="['/products', f.product.slug]" class="text-brand-700 hover:underline">{{
            f.product.name
          }}</a>
        </li>
      } @empty {
        <p class="text-slate-600">No favorites yet.</p>
      }
    </ul>
  `,
})
export class FavoritesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly favs = signal<Fav[]>([]);

  ngOnInit() {
    this.http.get<Fav[]>(`${environment.apiUrl}/favorites/me`).subscribe((r) => this.favs.set(r));
  }
}
