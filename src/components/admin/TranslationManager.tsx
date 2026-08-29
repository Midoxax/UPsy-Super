import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { translations } from "@/lib/i18n/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Save, RotateCcw, Check, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Locale = "en" | "fr" | "ar";

interface FlatEntry {
  key: string;
  en: string;
  fr: string;
  ar: string;
}

/** Flatten nested translation object into dot-notation keys */
function flattenObj(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      result[fullKey] = v;
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      Object.assign(result, flattenObj(v, fullKey));
    }
  }
  return result;
}

const TranslationManager = () => {
  const [search, setSearch] = useState("");
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);

  // Build flat entries from static translations
  const allEntries = useMemo<FlatEntry[]>(() => {
    const enFlat = flattenObj(translations.en);
    const frFlat = flattenObj(translations.fr);
    const arFlat = flattenObj(translations.ar);
    const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(frFlat), ...Object.keys(arFlat)]);
    return Array.from(allKeys)
      .sort()
      .map((key) => ({
        key,
        en: enFlat[key] || "",
        fr: frFlat[key] || "",
        ar: arFlat[key] || "",
      }));
  }, []);

  // Load existing overrides from DB
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("translation_overrides")
        .select("locale, translation_key, translation_value");
      if (data) {
        const map: Record<string, Record<string, string>> = {};
        for (const row of data) {
          if (!map[row.locale]) map[row.locale] = {};
          map[row.locale][row.translation_key] = row.translation_value;
        }
        setOverrides(map);
      }
    };
    load();
  }, []);

  // Filter entries
  const filtered = useMemo(() => {
    let list = allEntries;
    if (missingOnly) {
      list = list.filter((e) => {
        // Missing if static value is empty AND no override exists for the active locale
        const hasStatic = !!e[activeLocale]?.trim();
        const hasOverride = !!overrides[activeLocale]?.[e.key]?.trim() || !!pendingChanges[activeLocale]?.[e.key]?.trim();
        return !hasStatic && !hasOverride;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.key.toLowerCase().includes(q) ||
          e.en.toLowerCase().includes(q) ||
          e.fr.toLowerCase().includes(q) ||
          e.ar.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allEntries, search, missingOnly, activeLocale, overrides, pendingChanges]);

  const missingCount = useMemo(() => {
    return allEntries.filter((e) => {
      const hasStatic = !!e[activeLocale]?.trim();
      const hasOverride = !!overrides[activeLocale]?.[e.key]?.trim() || !!pendingChanges[activeLocale]?.[e.key]?.trim();
      return !hasStatic && !hasOverride;
    }).length;
  }, [allEntries, activeLocale, overrides, pendingChanges]);

  // Group by top-level namespace
  const grouped = useMemo(() => {
    const groups: Record<string, FlatEntry[]> = {};
    for (const entry of filtered) {
      const ns = entry.key.split(".")[0];
      if (!groups[ns]) groups[ns] = [];
      groups[ns].push(entry);
    }
    return groups;
  }, [filtered]);

  const getValue = (key: string, locale: Locale) => {
    return pendingChanges[locale]?.[key] ?? overrides[locale]?.[key] ?? undefined;
  };

  const getDisplayValue = (entry: FlatEntry, locale: Locale) => {
    const override = getValue(key(entry), locale);
    return override !== undefined ? override : entry[locale];
  };

  const key = (entry: FlatEntry) => entry.key;

  const handleChange = (entryKey: string, locale: Locale, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [locale]: {
        ...(prev[locale] || {}),
        [entryKey]: value,
      },
    }));
  };

  const handleReset = (entryKey: string, locale: Locale) => {
    // Remove from pending
    setPendingChanges((prev) => {
      const next = { ...prev };
      if (next[locale]) {
        const { [entryKey]: _, ...rest } = next[locale];
        next[locale] = rest;
      }
      return next;
    });
    // Remove from overrides (will delete from DB on save)
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[locale]) {
        const { [entryKey]: _, ...rest } = next[locale];
        next[locale] = rest;
      }
      return next;
    });
  };

  const pendingCount = Object.values(pendingChanges).reduce(
    (acc, localeMap) => acc + Object.keys(localeMap).length,
    0
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts: { locale: string; translation_key: string; translation_value: string }[] = [];
      for (const [locale, keys] of Object.entries(pendingChanges)) {
        for (const [k, v] of Object.entries(keys)) {
          upserts.push({ locale, translation_key: k, translation_value: v });
        }
      }

      if (upserts.length > 0) {
        const { error } = await supabase
          .from("translation_overrides")
          .upsert(upserts, { onConflict: "locale,translation_key" });

        if (error) throw error;
      }

      // Merge pending into overrides
      setOverrides((prev) => {
        const next = { ...prev };
        for (const [locale, keys] of Object.entries(pendingChanges)) {
          next[locale] = { ...(next[locale] || {}), ...keys };
        }
        return next;
      });
      setPendingChanges({});
      toast.success(`${upserts.length} translation(s) saved`);
    } catch (err: any) {
      toast.error("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const locales: { value: Locale; label: string; flag: string }[] = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "fr", label: "French", flag: "🇫🇷" },
    { value: "ar", label: "Arabic", flag: "🇲🇦" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Translation Manager
            </CardTitle>
            <CardDescription>
              {allEntries.length} translation keys · {filtered.length} shown
            </CardDescription>
          </div>
          {pendingCount > 0 && (
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save {pendingCount} change{pendingCount !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by key or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setMissingOnly(false)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              !missingOnly
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            All ({allEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setMissingOnly(true)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5",
              missingOnly
                ? "bg-amber-500 text-white border-amber-500"
                : "border-border text-muted-foreground hover:border-amber-500/40",
            )}
          >
            <AlertCircle className="h-3 w-3" />
            Missing in {activeLocale.toUpperCase()} ({missingCount})
          </button>
        </div>

        {/* Locale Tabs */}
        <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)}>
          <TabsList>
            {locales.map((l) => (
              <TabsTrigger key={l.value} value={l.value}>
                {l.flag} {l.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((l) => (
            <TabsContent key={l.value} value={l.value} className="space-y-4 mt-4">
              {Object.entries(grouped).map(([ns, entries]) => (
                <div key={ns} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {ns}
                  </h3>
                  <div className="space-y-1">
                    {entries.map((entry) => {
                      const currentValue = getDisplayValue(entry, l.value);
                      const staticValue = entry[l.value];
                      const hasOverride =
                        overrides[l.value]?.[entry.key] !== undefined ||
                        pendingChanges[l.value]?.[entry.key] !== undefined;
                      const isPending = pendingChanges[l.value]?.[entry.key] !== undefined;

                      return (
                        <div
                          key={entry.key}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isPending
                              ? "bg-primary/5 border border-primary/20"
                              : hasOverride
                              ? "bg-accent/5 border border-accent/10"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <code className="text-xs text-muted-foreground w-64 shrink-0 truncate" title={entry.key}>
                            {entry.key}
                          </code>
                          <Input
                            value={currentValue}
                            onChange={(e) => handleChange(entry.key, l.value, e.target.value)}
                            className="flex-1 text-sm"
                            dir={l.value === "ar" ? "rtl" : "ltr"}
                          />
                          {hasOverride && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReset(entry.key, l.value)}
                              title="Reset to default"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {isPending && <Check className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No translations match your search.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TranslationManager;
