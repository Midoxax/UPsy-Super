// Every locale, eagerly. Only for code that genuinely needs all of them at
// once: the server renderer (see src/server.ts) and the admin translation
// manager. Components rendering copy go through the registry in ./messages so
// a visitor downloads only their own language.
import en from "./locales/en";
import fr from "./locales/fr";
import ar from "./locales/ar";
import ber from "./locales/ber";

export const translations = { en, fr, ar, ber };
