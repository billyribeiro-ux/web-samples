import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthSignInPage, AuthSignUpPage } from '@/auth/AuthWidgets.js';
import { PublicLayout } from '@/components/PublicLayout.js';
import { RequireAuth } from '@/components/RequireAuth.js';
import { AccountLayout } from '@/layouts/AccountLayout.js';
import { AdminLayout } from '@/layouts/AdminLayout.js';
import { HomePage } from '@/pages/Home.js';
import { CmsPage } from '@/pages/CmsPage.js';
import { ServicesPage } from '@/pages/Services.js';
import { PricingPage } from '@/pages/Pricing.js';
import { BlogIndexPage } from '@/pages/BlogIndex.js';
import { BlogPostPage } from '@/pages/BlogPost.js';
import { CategoryPage } from '@/pages/Category.js';
import { TagPage } from '@/pages/Tag.js';
import { SearchPage } from '@/pages/Search.js';
import { ContactPage } from '@/pages/Contact.js';
import { FaqPage } from '@/pages/Faq.js';
import { ProductListPage } from '@/pages/ProductList.js';
import { ProductDetailPage } from '@/pages/ProductDetail.js';
import { CartPage } from '@/pages/Cart.js';
import { CheckoutPage } from '@/pages/Checkout.js';
import { ThankYouPage } from '@/pages/ThankYou.js';
import { NotFoundPage } from '@/pages/NotFound.js';
import { MembersPage } from '@/pages/Members.js';
import { AccountHomePage } from '@/pages/account/AccountHome.js';
import { ProfilePage } from '@/pages/account/Profile.js';
import { SubscriptionPage } from '@/pages/account/Subscription.js';
import { OrdersPage } from '@/pages/account/Orders.js';
import { FavoritesPage } from '@/pages/account/Favorites.js';
import { AdminDashboardPage } from '@/pages/admin/Dashboard.js';
import { AdminPostsPage } from '@/pages/admin/AdminPosts.js';
import { AdminGenericListPage } from '@/pages/admin/AdminTable.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login/*" element={<AuthSignInPage />} />
      <Route path="/register/*" element={<AuthSignUpPage />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route path="/reset-password" element={<Navigate to="/login" replace />} />
      <Route path="/verify-email" element={<Navigate to="/login" replace />} />

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<CmsPage slug="about" />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="tag/:slug" element={<TagPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy-policy" element={<CmsPage slug="privacy-policy" />} />
        <Route path="terms" element={<CmsPage slug="terms" />} />
        <Route path="cookies" element={<CmsPage slug="cookies" />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="thank-you" element={<ThankYouPage />} />
        <Route path="members" element={<MembersPage />} />

        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AccountHomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route
            path="pages"
            element={<AdminGenericListPage title="Pages" path="/api/admin/pages" columns={[{ key: 'slug', header: 'Slug' }, { key: 'title', header: 'Title' }, { key: 'status', header: 'Status' }]} />}
          />
          <Route
            path="products"
            element={
              <AdminGenericListPage
                title="Products"
                path="/api/admin/products"
                columns={[
                  { key: 'slug', header: 'Slug' },
                  { key: 'title', header: 'Title' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="orders"
            element={
              <AdminGenericListPage
                title="Orders"
                path="/api/admin/orders"
                columns={[
                  { key: 'id', header: 'ID' },
                  { key: 'status', header: 'Status' },
                  { key: 'totalCents', header: 'Total (cents)' },
                ]}
              />
            }
          />
          <Route
            path="forms"
            element={
              <AdminGenericListPage
                title="Form submissions"
                path="/api/admin/forms"
                columns={[
                  { key: 'type', header: 'Type' },
                  { key: 'createdAt', header: 'Created' },
                ]}
              />
            }
          />
          <Route
            path="users"
            element={
              <AdminGenericListPage
                title="Users"
                path="/api/admin/users"
                columns={[
                  { key: 'email', header: 'Email' },
                  { key: 'role', header: 'Role' },
                ]}
              />
            }
          />
          <Route
            path="settings"
            element={
              <AdminGenericListPage title="Site settings" path="/api/admin/settings" columns={[{ key: 'key', header: 'Key' }]} />
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
