import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Page not found</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950"
      >
        Back home
      </Link>
    </div>
  );
}
