# l-22-reducer — useReducer-impl av context (avansert)

Avansert-branch for leksjon 22. Demonstrerer useReducer-mønsteret for kompleks
state-håndtering inne i en Context Provider.

## Hva som skiller seg fra `l-22`

- Beholder useReducer-basert state-håndtering (actions + reducer + dispatch)
- `l-22` (basis) bruker enklere useState-basert context

> ⚠️ I dag er begge branches kopier. Cleanup-TODO: i `l-22`, erstatt useReducer-koden
> med useState-context for å holde basis-lecture enkel.

## Læringsmål

- useReducer som mønster for state-overganger med flere actions
- Sammenligning useState vs useReducer i context
- Når Redux ville vært overkill men reducer fortsatt passer
