import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const SiteLayout = () => import("@/components/layout/SiteLayout.vue");
const AccountLayout = () => import("@/components/layout/AccountLayout.vue");
const AdminLayout = () => import("@/components/layout/AdminLayout.vue");

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: SiteLayout,
      children: [
        { path: "", name: "home", component: () => import("@/views/public/HomeView.vue") },
        {
          path: "about",
          name: "about",
          meta: { pageSlug: "about" },
          component: () => import("@/views/public/DynamicPageView.vue"),
        },
        { path: "services", name: "services", component: () => import("@/views/public/ServicesView.vue") },
        {
          path: "services/:slug",
          name: "service-detail",
          component: () => import("@/views/public/ProductDetailView.vue"),
        },
        { path: "pricing", name: "pricing", component: () => import("@/views/public/PricingView.vue") },
        { path: "blog", name: "blog", component: () => import("@/views/public/BlogListView.vue") },
        { path: "blog/:slug", name: "blog-post", component: () => import("@/views/public/BlogPostView.vue") },
        {
          path: "category/:slug",
          name: "category",
          component: () => import("@/views/public/BlogListView.vue"),
        },
        {
          path: "tag/:slug",
          name: "tag",
          component: () => import("@/views/public/BlogListView.vue"),
        },
        { path: "search", name: "search", component: () => import("@/views/public/SearchView.vue") },
        { path: "contact", name: "contact", component: () => import("@/views/public/ContactView.vue") },
        {
          path: "faq",
          name: "faq",
          meta: { pageSlug: "faq" },
          component: () => import("@/views/public/DynamicPageView.vue"),
        },
        {
          path: "privacy-policy",
          name: "privacy",
          meta: { pageSlug: "privacy-policy" },
          component: () => import("@/views/public/DynamicPageView.vue"),
        },
        {
          path: "terms",
          name: "terms",
          meta: { pageSlug: "terms" },
          component: () => import("@/views/public/DynamicPageView.vue"),
        },
        {
          path: "cookies",
          name: "cookies",
          meta: { pageSlug: "cookies" },
          component: () => import("@/views/public/DynamicPageView.vue"),
        },
        { path: "cart", name: "cart", component: () => import("@/views/public/CartView.vue") },
        { path: "checkout", name: "checkout", component: () => import("@/views/public/CheckoutView.vue") },
        { path: "thank-you", name: "thank-you", component: () => import("@/views/public/ThankYouView.vue") },
      ],
    },
    {
      path: "/login",
      component: SiteLayout,
      children: [{ path: "", name: "login", component: () => import("@/views/auth/LoginView.vue") }],
    },
    {
      path: "/register",
      component: SiteLayout,
      children: [{ path: "", name: "register", component: () => import("@/views/auth/RegisterView.vue") }],
    },
    {
      path: "/forgot-password",
      component: SiteLayout,
      children: [
        { path: "", name: "forgot-password", component: () => import("@/views/auth/ForgotPasswordView.vue") },
      ],
    },
    {
      path: "/reset-password",
      component: SiteLayout,
      children: [
        { path: "", name: "reset-password", component: () => import("@/views/auth/ResetPasswordView.vue") },
      ],
    },
    {
      path: "/verify-email",
      component: SiteLayout,
      children: [
        { path: "", name: "verify-email", component: () => import("@/views/auth/VerifyEmailView.vue") },
      ],
    },
    {
      path: "/account",
      component: AccountLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "account", component: () => import("@/views/account/AccountHomeView.vue") },
        { path: "profile", name: "account-profile", component: () => import("@/views/account/ProfileView.vue") },
        {
          path: "subscription",
          name: "account-subscription",
          component: () => import("@/views/account/SubscriptionView.vue"),
        },
        { path: "orders", name: "account-orders", component: () => import("@/views/account/OrdersView.vue") },
        {
          path: "favorites",
          name: "account-favorites",
          component: () => import("@/views/account/FavoritesView.vue"),
        },
      ],
    },
    {
      path: "/members",
      component: AccountLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "members-library", component: () => import("@/views/members/LibraryView.vue") },
      ],
    },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresPermission: "posts.read" },
      children: [
        { path: "", name: "admin", component: () => import("@/views/admin/DashboardView.vue") },
        { path: "posts", name: "admin-posts", component: () => import("@/views/admin/PostsAdminView.vue") },
        { path: "pages", name: "admin-pages", component: () => import("@/views/admin/PagesAdminView.vue") },
        {
          path: "products",
          name: "admin-products",
          component: () => import("@/views/admin/ProductsAdminView.vue"),
        },
        { path: "orders", name: "admin-orders", component: () => import("@/views/admin/OrdersAdminView.vue") },
        { path: "users", name: "admin-users", component: () => import("@/views/admin/UsersAdminView.vue") },
        { path: "forms", name: "admin-forms", component: () => import("@/views/admin/FormsAdminView.vue") },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("@/views/admin/SettingsAdminView.vue"),
        },
        { path: "media", name: "admin-media", component: () => import("@/views/admin/MediaAdminView.vue") },
      ],
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/public/NotFoundView.vue") },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.me && !auth.loading) {
    await auth.refreshMe();
  }
  if (to.meta.requiresAuth && !auth.isAuthed) {
    return { name: "login", query: { next: to.fullPath } };
  }
  const perm = to.meta.requiresPermission as string | undefined;
  if (perm && !auth.me?.permissions?.includes(perm)) {
    return { name: "home" };
  }
  return true;
});
