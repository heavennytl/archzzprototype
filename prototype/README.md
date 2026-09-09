# Prototype maintenance map

This split is intentionally small. The demo keeps page orchestration together while moving stable, reusable concerns out of `app/page.tsx`.

- `types.ts`: shared page, account, model, order and benefit types.
- `data.ts`: model catalog, Today’s Free inventory and legal/help copy.
- `fixtures.ts`: seeded legacy-benefit, order and billing states used by the prototype switcher.
- `commerce.ts`: price, cart limit, benefit priority/allocation and transaction labels.
- `components/brand.tsx`: the ARCHZZ wordmark and reusable icons.
- `components/modals.tsx`: generic sign-in, confirmation, license and success dialogs.
- `app/page.tsx`: navigation, prototype state and end-to-end interaction orchestration.
- `app/globals.css`: shared visual system; kept together so global design changes remain easy to tune.

When a requirement changes, update the rule or fixture at its source first, then adjust the relevant interaction in `app/page.tsx`. Avoid duplicating prices, limits or benefit priority inside page components.
