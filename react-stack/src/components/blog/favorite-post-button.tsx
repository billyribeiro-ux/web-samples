"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { togglePostFavorite } from "@/actions/favorites";
import { trackEvent } from "@/lib/analytics";

export function FavoritePostButton({
  postId,
  initialFavorite,
}: {
  postId: string;
  initialFavorite: boolean;
}) {
  const [pending, start] = useTransition();
  const [fav, setFav] = useState(initialFavorite);

  return (
    <Button
      type="button"
      variant={fav ? "secondary" : "outline"}
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await togglePostFavorite(postId);
          setFav((x) => !x);
          trackEvent("favorite_post_toggle", { postId, favorited: !fav });
        });
      }}
    >
      {pending ? "…" : fav ? "Saved" : "Save article"}
    </Button>
  );
}
