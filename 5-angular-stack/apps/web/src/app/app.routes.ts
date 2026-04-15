import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { memberGuard } from './core/guards/member.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./public/page-view/page-view.component').then((m) => m.PageViewComponent),
        data: { slug: 'about' },
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./public/services/services.component').then((m) => m.ServicesComponent),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./public/pricing/pricing.component').then((m) => m.PricingComponent),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./public/blog/blog-list.component').then((m) => m.BlogListComponent),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./public/blog/blog-post.component').then((m) => m.BlogPostComponent),
      },
      {
        path: 'category/:slug',
        loadComponent: () =>
          import('./public/blog/category.component').then((m) => m.CategoryComponent),
      },
      {
        path: 'tag/:slug',
        loadComponent: () => import('./public/blog/tag.component').then((m) => m.TagComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./public/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./public/contact/contact.component').then((m) => m.ContactComponent),
      },
      {
        path: 'faq',
        loadComponent: () => import('./public/faq/faq.component').then((m) => m.FaqComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./public/legal/legal.component').then((m) => m.LegalComponent),
        data: { slug: 'privacy-policy', title: 'Privacy Policy' },
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./public/legal/legal.component').then((m) => m.LegalComponent),
        data: { slug: 'terms', title: 'Terms of Service' },
      },
      {
        path: 'cookies',
        loadComponent: () =>
          import('./public/legal/legal.component').then((m) => m.LegalComponent),
        data: { slug: 'cookies', title: 'Cookie Policy' },
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./public/store/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/:slug',
        loadComponent: () =>
          import('./public/store/product-detail.component').then((m) => m.ProductDetailComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./public/store/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./public/store/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'thank-you',
        loadComponent: () =>
          import('./public/thank-you/thank-you.component').then((m) => m.ThankYouComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./public/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./public/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'account',
        canActivate: [memberGuard],
        loadComponent: () =>
          import('./account/account-shell.component').then((m) => m.AccountShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./account/account-dashboard.component').then(
                (m) => m.AccountDashboardComponent,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./account/profile.component').then((m) => m.ProfileComponent),
          },
          {
            path: 'subscription',
            loadComponent: () =>
              import('./account/subscription.component').then((m) => m.SubscriptionComponent),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./account/orders.component').then((m) => m.OrdersComponent),
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('./account/favorites.component').then((m) => m.FavoritesComponent),
          },
        ],
      },
      {
        path: 'library',
        canActivate: [memberGuard],
        loadComponent: () =>
          import('./public/members/library.component').then((m) => m.LibraryComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./public/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'posts',
        loadComponent: () =>
          import('./admin/posts-admin.component').then((m) => m.PostsAdminComponent),
      },
      {
        path: 'pages',
        loadComponent: () =>
          import('./admin/pages-admin.component').then((m) => m.PagesAdminComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin/products-admin.component').then((m) => m.ProductsAdminComponent),
      },
      {
        path: 'media',
        loadComponent: () =>
          import('./admin/media-admin.component').then((m) => m.MediaAdminComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users-admin.component').then((m) => m.UsersAdminComponent),
      },
      {
        path: 'forms',
        loadComponent: () =>
          import('./admin/forms-admin.component').then((m) => m.FormsAdminComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/settings-admin.component').then((m) => m.SettingsAdminComponent),
      },
    ],
  },
];
