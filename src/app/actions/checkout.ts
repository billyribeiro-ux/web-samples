"use server";

import { redirect } from "next/navigation";
import { createCartCheckoutSessionAction } from "@/app/actions/stripe";

export async function checkoutCartAction() {
  const url = await createCartCheckoutSessionAction();
  if (url) redirect(url);
}
