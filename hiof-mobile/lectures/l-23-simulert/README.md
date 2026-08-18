# l-23-simulert — Full simulert auth-impl (avansert)

Avansert-dybde for leksjon 23. Se [`ADVANCED.md`](./ADVANCED.md) for hva som
skiller seg fra basis-branchen `l-23`.

Hovedlæringsmål: hvordan auth-flyten henger sammen før man bytter til et
bibliotek — login/register/logout, session-persistens med AsyncStorage.

---

## Oppsett og feilsøking

Før første kjøring:

- Expo Go må være bygget for **SDK 56**. Versjonen i Play Store kan være låst til
  en eldre SDK selv om den sier «nyeste versjon» — last ned APK-en for SDK 56 fra
  [expo.dev/go](https://expo.dev/go).
- Ingen globalt installert `expo-cli`. Sjekk `npm ls -g --depth=0`, fjern med
  `npm uninstall -g expo-cli`, og kjør `npx expo` lokalt i stedet.
- Windows: Developer Mode og lange stier slått på, repoet på kort sti utenfor
  OneDrive.

Full guide, brannmur-feil («Failed to download remote update») og feiltabell:
[`../../OPPSETT.md`](../../OPPSETT.md).
