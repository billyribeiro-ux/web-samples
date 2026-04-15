import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        {type === "order"
          ? "Your order is confirmed. You will receive a receipt by email."
          : "Your submission was received."}
      </p>
    </div>
  );
}
