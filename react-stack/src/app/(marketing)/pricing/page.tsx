import type { Metadata } from "next";
import Link from "next/link";
import { prisma, withDbFallback } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans with room to grow. Stripe-ready subscription architecture.",
};

export default async function PricingPage() {
  const plans = await withDbFallback(
    () => prisma.plan.findMany({ orderBy: { monthlyAmountCents: "asc" } }),
    [],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Plans are stored in Postgres and mapped to Stripe Price IDs for real
          renewals and proration.
        </p>
      </div>
      {!plans.length ? (
        <p className="mx-auto mt-10 max-w-xl rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No plans loaded. Connect PostgreSQL, run migrations, then{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            npm run db:seed
          </code>
          .
        </p>
      ) : null}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">
                {p.monthlyAmountCents === 0
                  ? "Free"
                  : `$${(p.monthlyAmountCents ?? 0) / 100}/mo`}
              </p>
              {p.featuresJson ? (
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {(JSON.parse(p.featuresJson) as string[]).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
              <Button asChild className="w-full">
                <Link href="/account/subscription">Choose plan</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
