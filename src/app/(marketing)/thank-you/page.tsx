import Link from "next/link";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Thank you</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        {type === "subscription"
          ? "Your subscription is being activated. You will receive a confirmation email shortly."
          : "Your payment was received. Order details appear in your account when signed in."}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/account/orders" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          View orders
        </Link>
        <Link href="/" className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300">
          Home
        </Link>
      </div>
    </div>
  );
}
