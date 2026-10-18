// Client entry: TanStack Start's default, plus one step before hydration.
//
// Non-English copy is code-split (src/lib/i18n/messages.ts). The server
// rendered this page in the URL's locale, so that locale's messages must be
// in memory before React hydrates; otherwise the first client render would
// be English, mismatch the server markup, and flash the wrong language.
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { loadLocale } from "@/lib/i18n/messages";
import { getLocaleFromPath } from "@/lib/i18n/utils";

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}

// A failed fetch still hydrates: English is the documented fallback, and a
// page that never becomes interactive is worse than one in the wrong language.
loadLocale(getLocaleFromPath(window.location.pathname)).then(hydrate, hydrate);
