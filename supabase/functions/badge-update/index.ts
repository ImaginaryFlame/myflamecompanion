// supabase/functions/badge-update/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Exemple : Donne un badge aux utilisateurs qui ont 10 histoires
  const { data: users } = await supabase
    .from("utilisateurs")
    .select("id")
    .gt("nb_histoires", 9);

  for (const user of users ?? []) {
    await supabase.from("badges_utilisateur").upsert({
      utilisateur_id: user.id,
      badge_id: "badge_ten_stories", // id à adapter
    });
  }

  return new Response("Badges mis à jour", { status: 200 });
});
