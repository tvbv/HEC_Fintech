import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(40),
  context: z.object({
    first_name: z.string().optional(),
    nationality: z.string().optional(),
    employment_status: z.string().optional(),
    completed_buildings: z.array(z.string()).optional(),
    documents_count: z.number().optional(),
    benefits: z.array(z.string()).optional(),
  }).optional(),
});

export const chatWithCleo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: null, error: "Service IA non configuré." };
    }

    const ctx = data.context ?? {};
    const systemPrompt = `Tu es Cléo, la mascotte concierge d'une appli qui aide les expatriés à s'installer en France.
Style : amical, tutoie l'utilisateur, français pétillant, phrases courtes (<3 lignes), tu peux utiliser un emoji par message max.
Tu connais les démarches FR (banque, impôts, logement, assurance, transport, travail, retraite, enfants, aides sociales).
Tu ne fais JAMAIS de longs discours juridiques. Tu donnes UNE étape concrète et un lien officiel quand pertinent.

Profil utilisateur connu :
- Prénom : ${ctx.first_name ?? "inconnu"}
- Nationalité : ${ctx.nationality ?? "inconnue"}
- Situation : ${ctx.employment_status ?? "inconnue"}
- Bâtiments complétés : ${(ctx.completed_buildings ?? []).join(", ") || "aucun"}
- Documents uploadés : ${ctx.documents_count ?? 0}
- Aides obtenues : ${(ctx.benefits ?? []).join(", ") || "aucune"}

Si la question dépasse ton scope (médical, juridique pointu), redirige vers un pro.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...data.messages,
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { reply: null, error: "Trop de messages, réessaie dans une minute." };
        if (res.status === 402) return { reply: null, error: "Crédits IA épuisés." };
        const t = await res.text();
        console.error("AI gateway:", res.status, t);
        return { reply: null, error: "Cléo est indisponible." };
      }

      const j = await res.json();
      const reply = j?.choices?.[0]?.message?.content as string | undefined;
      if (!reply) return { reply: null, error: "Pas de réponse." };
      return { reply, error: null };
    } catch (e) {
      console.error("chat error", e);
      return { reply: null, error: "Erreur réseau." };
    }
  });
