/** Public plan fields used by pricing UI and `/api/plans`. */
export type PlanCardModel = {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthlyCents: number
  priceYearlyCents: number
  highlighted?: boolean | null
  stripePriceMonthlyId?: string | null
  stripePriceYearlyId?: string | null
  features?: unknown
}

export type PlansApiResponse = {
  items: PlanCardModel[]
  source?: 'database' | 'fallback'
}
