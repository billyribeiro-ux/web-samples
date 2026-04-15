import { useHead } from "@unhead/vue";
import { computed, type Ref } from "vue";

const defaultSite = "Apex Platform";

export function useSeo(opts: {
  title: Ref<string> | string;
  description?: Ref<string | undefined> | string;
  path?: string;
  image?: string;
}) {
  const title = computed(() => (typeof opts.title === "string" ? opts.title : opts.title.value));
  const description = computed(() =>
    typeof opts.description === "string" || opts.description === undefined
      ? opts.description
      : opts.description.value,
  );

  useHead({
    title: computed(() => (title.value ? `${title.value} · ${defaultSite}` : defaultSite)),
    meta: [
      {
        name: "description",
        content: computed(() => description.value ?? ""),
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: computed(() => description.value ?? ""),
      },
      ...(opts.image
        ? [{ property: "og:image", content: opts.image }]
        : []),
    ],
  });
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: defaultSite,
    url: typeof window !== "undefined" ? window.location.origin : "",
  };
}
