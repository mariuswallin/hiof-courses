# l-23-simulert — Full simulert auth-impl (avansert)

Avansert-branch for leksjon 23. Demonstrerer en komplett simulert auth-flyt
(login, register, logout, session-håndtering, AsyncStorage-persistens) uten å
trekke inn et auth-bibliotek.

## Hva som skiller seg fra `l-23`

- Beholder full simulert login/register/logout-implementasjon
- AsyncStorage-persistens av session-token
- `l-23` (basis) er forenklet til pseudokode + tekst-beskrivelse

> ⚠️ I dag er begge branches kopier av samme kode. Cleanup-TODO: i `l-23`, fjern
> implementasjonsdetaljer og behold kun grensesnitt + tekst som peker hit.

## Læringsmål

- Hvordan auth-flyten henger sammen før man bytter til et bibliotek (leksjon 24)
- AsyncStorage som persistens-lag
- Sessions vs JWT — implisitt valg
- Hvorfor man til slutt vil bruke et bibliotek (better-auth, Appwrite, Clerk)
