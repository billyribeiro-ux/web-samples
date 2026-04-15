export type AuthUser = {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  imageUrl: string | null
}

export type AuthRole = { slug: string; name: string }

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const roles = useState<AuthRole[]>('auth-roles', () => [])
  const pending = useState('auth-pending', () => true)

  async function refresh() {
    try {
      const res = await $fetch<{ user: AuthUser | null; roles: AuthRole[] }>('/api/auth/me')
      user.value = res.user
      roles.value = res.roles ?? []
    } catch {
      user.value = null
      roles.value = []
    } finally {
      pending.value = false
    }
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() =>
    roles.value.some((r) => ['super_admin', 'admin', 'editor'].includes(r.slug)),
  )

  return { user, roles, pending, refresh, isLoggedIn, isAdmin }
}
