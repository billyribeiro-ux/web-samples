import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { trackPageView } from "@/lib/analytics";
import { apiJson } from "@/lib/api";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/PublicLayout.vue"),
      children: [
        { path: "", name: "home", component: () => import("@/views/public/HomeView.vue") },
        { path: "about", name: "about", component: () => import("@/views/public/AboutView.vue") },
        { path: "services", name: "services", component: () => import("@/views/public/ServicesView.vue") },
        { path: "pricing", name: "pricing", component: () => import("@/views/public/PricingView.vue") },
        { path: "blog", name: "blog", component: () => import("@/views/public/BlogIndexView.vue") },
        { path: "blog/:slug", name: "blog-post", component: () => import("@/views/public/BlogPostView.vue") },
        { path: "category/:slug", name: "category", component: () => import("@/views/public/CategoryView.vue") },
        { path: "tag/:slug", name: "tag", component: () => import("@/views/public/TagView.vue") },
        { path: "search", name: "search", component: () => import("@/views/public/SearchView.vue") },
        { path: "contact", name: "contact", component: () => import("@/views/public/ContactView.vue") },
        { path: "faq", name: "faq", component: () => import("@/views/public/FaqView.vue") },
        { path: "privacy-policy", name: "privacy", component: () => import("@/views/public/LegalView.vue"), props: { pageKey: "privacy" } },
        { path: "terms", name: "terms", component: () => import("@/views/public/LegalView.vue"), props: { pageKey: "terms" } },
        { path: "cookies", name: "cookies", component: () => import("@/views/public/LegalView.vue"), props: { pageKey: "cookies" } },
        { path: "cart", name: "cart", component: () => import("@/views/public/CartView.vue") },
        { path: "checkout", name: "checkout", component: () => import("@/views/public/CheckoutView.vue") },
        { path: "thank-you", name: "thank-you", component: () => import("@/views/public/ThankYouView.vue") },
      ],
    },
    {
      path: "/login",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [{ path: "", name: "login", component: () => import("@/views/auth/LoginView.vue") }],
    },
    {
      path: "/register",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [{ path: "", name: "register", component: () => import("@/views/auth/RegisterView.vue") }],
    },
    {
      path: "/forgot-password",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [{ path: "", name: "forgot", component: () => import("@/views/auth/ForgotPasswordView.vue") }],
    },
    {
      path: "/reset-password",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [{ path: "", name: "reset", component: () => import("@/views/auth/ResetPasswordView.vue") }],
    },
    {
      path: "/verify-email",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [{ path: "", name: "verify", component: () => import("@/views/auth/VerifyEmailView.vue") }],
    },
    {
      path: "/account",
      component: () => import("@/layouts/AccountLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "account", component: () => import("@/views/account/DashboardView.vue") },
        { path: "profile", name: "account-profile", component: () => import("@/views/account/ProfileView.vue") },
        { path: "subscription", name: "account-sub", component: () => import("@/views/account/SubscriptionView.vue") },
        { path: "orders", name: "account-orders", component: () => import("@/views/account/OrdersView.vue") },
        { path: "favorites", name: "account-favorites", component: () => import("@/views/account/FavoritesView.vue") },
      ],
    },
    {
      path: "/members",
      component: () => import("@/layouts/PublicLayout.vue"),
      meta: { requiresAuth: true, members: true },
      children: [{ path: "", name: "members", component: () => import("@/views/members/MembersView.vue") }],
    },
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: "", name: "admin", component: () => import("@/views/admin/AdminDashboardView.vue") },
        { path: "pages", name: "admin-pages", component: () => import("@/views/admin/AdminPagesView.vue") },
        { path: "posts", name: "admin-posts", component: () => import("@/views/admin/AdminPostsView.vue") },
        { path: "categories", name: "admin-categories", component: () => import("@/views/admin/AdminSimpleView.vue"), props: { kind: "categories" } },
        { path: "tags", name: "admin-tags", component: () => import("@/views/admin/AdminSimpleView.vue"), props: { kind: "tags" } },
        { path: "media", name: "admin-media", component: () => import("@/views/admin/AdminMediaView.vue") },
        { path: "users", name: "admin-users", component: () => import("@/views/admin/AdminUsersView.vue") },
        { path: "products", name: "admin-products", component: () => import("@/views/admin/AdminProductsView.vue") },
        { path: "orders", name: "admin-orders", component: () => import("@/views/admin/AdminOrdersView.vue") },
        { path: "subscriptions", name: "admin-subs", component: () => import("@/views/admin/AdminSubscriptionsView.vue") },
        { path: "forms", name: "admin-forms", component: () => import("@/views/admin/AdminFormsView.vue") },
        { path: "navigation", name: "admin-nav", component: () => import("@/views/admin/AdminNavigationView.vue") },
        { path: "settings", name: "admin-settings", component: () => import("@/views/admin/AdminSettingsView.vue") },
      ],
    },
    { path: "/:pathMatch(.*)*", name: "notfound", component: () => import("@/views/public/NotFoundView.vue") },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  trackPageView(to.fullPath);
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.members) {
    await auth.fetchMe();
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: "home" });
    return;
  }
  if (to.meta.members) {
    try {
      const gate = await apiJson<{ allowed: boolean }>(`/gated/check?path=${encodeURIComponent(to.path)}`);
      if (!gate.allowed) {
        next({ name: "pricing" });
        return;
      }
    } catch {
      next({ name: "pricing" });
      return;
    }
  }
  next();
});

export default router;
