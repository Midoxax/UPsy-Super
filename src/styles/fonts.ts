/**
 * Brand type system, as a single side-effect module.
 *
 * Fraunces / Cormorant Garamond (display) + Manrope (body) + Amiri (Arabic) +
 * JetBrains Mono (numerals), and Sora / IBM Plex Sans for the OPS surfaces.
 *
 * Kept as JS imports rather than CSS `@import`s: Tailwind v4 resolves CSS
 * imports from the filesystem, so pulling `@fontsource/*` from node_modules
 * belongs on the bundler side. Importing this module once — from the app root
 * and from the library entry point — means anything consuming the components
 * gets the fonts with them, instead of silently falling back to system stacks.
 */
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/jetbrains-mono/500.css";
