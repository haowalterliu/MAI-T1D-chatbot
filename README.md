# MAI-T1D Research Platform

React/Vite frontend with a Vercel `/api/chat` function using OpenAI Responses and application-defined dataset tools.

## Run locally

Requires Node.js 22.12+ (Vite 8).

```sh
npm ci
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local. Never commit the key.
npm run dev
```

- `OPENAI_API_KEY`: server-only OpenAI project API key.
- `OPENAI_MODEL`: defaults to `gpt-6-astra`; the configured model must support Responses, function calling, and low reasoning effort. Check your project's model access before deploying.
- Do not prefix the key with `VITE_`; Vite-prefixed variables are exposed to browsers.

## Deploy on Vercel

1. Merge the OpenAI migration into the repository/branch linked to the existing Vercel project.
2. In that project's **Settings → Environment Variables**, set `OPENAI_API_KEY` for **Production** (and Preview if needed). Set `OPENAI_MODEL` if overriding the default.
3. In **Deployments**, redeploy the updated branch. Environment changes do not affect existing deployments.
4. Once Ready, open `/selection` and ask `Show me all T1D donors from HPAP`.
5. Verify the tool activity includes `filter_donors` and that the filtered card has 45 donors for `clinical_diagnosis contains T1DM`. This includes T1DM Recent, T1DM DKA, and T1DM/MODY records; exact `T1DM` alone has 38.

If authentication fails, check the OpenAI key/project permissions. For usage errors, check API billing and limits. For model errors, check `OPENAI_MODEL` and model access. The application now shows these errors instead of silently substituting mock answers.

The existing GitHub Pages workflow only hosts static frontend assets. Live AI requests require the Vercel function or the local Vite middleware.

## Data and request flow

HPAP's 194 records are bundled in `src/data/hpapRealData.js`, imported by both frontend and server. TEDDY, ImmPort, and TrialNet remain demo placeholders. There is no external database connection in this implementation.

The model calls server-side lookup/filter functions, receives their results, and returns dataset markers consumed by the frontend. The OpenAI loop retains function-call IDs and encrypted reasoning items between tool turns with `store: false`. Browser events expose tool activity, not private reasoning. The loop has an 80-second deadline and a 15-turn cap; the browser timeout is 90 seconds.

## Validation

```sh
npm test
npm run build
npm run lint
```

Tests use mocked OpenAI responses with real local dataset tools; they make no paid API calls. A production smoke test still requires a valid OpenAI key and model access. Repository-wide lint has existing failures in unrelated UI files; lint changed files separately when reviewing this migration.

[OpenAI function calling documentation](https://developers.openai.com/api/docs/guides/function-calling)
