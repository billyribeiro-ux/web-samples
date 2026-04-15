import Link from "next/link";
import { getBrandName, getFooterColumns } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export async function SiteFooter() {
  const [brand, columns] = await Promise.all([
    getBrandName(),
    getFooterColumns(),
  ]);

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div>
          <p className="font-semibold">{brand}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A production-minded marketing, membership, and commerce stack built
            on Next.js.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-foreground" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-sm font-semibold">Newsletter</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Product updates and playbooks.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand}. All rights reserved.
      </div>
    </footer>
  );
}
