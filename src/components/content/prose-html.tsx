import DOMPurify from "isomorphic-dompurify";

type ProseHtmlProps = {
  html: string;
  className?: string;
};

export function ProseHtml({ html, className = "" }: ProseHtmlProps) {
  const clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
    ADD_TAGS: ["iframe"],
  });
  return (
    <div
      className={`cms-content max-w-none space-y-4 text-base leading-relaxed text-zinc-800 dark:text-zinc-200 [&_a]:text-emerald-700 [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_p]:leading-relaxed [&_ul]:list-disc ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
