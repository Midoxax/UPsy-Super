import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withLogo } from "@/components/UpsyLogo";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Link, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { usePublicationsCopy } from "@/lib/shop/publicationsCopy";
import { useLeagueMembership } from "@/hooks/useLeagueMembership";
import SEOHead from "@/components/SEOHead";
import LsspmLogo from "@/components/league/LsspmLogo";
import MyOrders, { myOrdersKey } from "@/components/shop/MyOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** One publication: its versions and prices, and the order form. */
export default function PublicationDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t, locale } = usePublicationsCopy();
  const loc = useLocalizedField();
  const qc = useQueryClient();
  const { data: membership } = useLeagueMembership();
  const isMember = !!membership?.active;
  const { data: p, isLoading } = useQuery({
    queryKey: ["publication", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: shipping = 0 } = useQuery({
    queryKey: ["shop-shipping"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("shop_settings")
        .select("shipping_fee_mad")
        .maybeSingle();
      return Number(data?.shipping_fee_mad ?? 0);
    },
  });
  const [format, setFormat] = useState<"print" | "ebook" | null>(null);
  const [qty, setQty] = useState(1);
  const [ship, setShip] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [busy, setBusy] = useState(false);

  if (isLoading)
    return (
      <div className="container-custom py-10">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  if (!p)
    return (
      <div className="container-custom py-10">
        <p className="text-muted-foreground">{t.none}</p>
      </div>
    );

  const versions = (["print", "ebook"] as const)
    .map((f) => {
      const pub = f === "print" ? p.price_print : p.price_ebook;
      const mem = f === "print" ? p.price_print_member : p.price_ebook_member;
      return pub == null
        ? null
        : { f, pub: Number(pub), mem: mem == null ? null : Number(mem) };
    })
    .filter(
      (v): v is { f: "print" | "ebook"; pub: number; mem: number | null } =>
        !!v,
    );
  const chosen = versions.find((v) => v.f === format) ?? versions[0];
  const unit = chosen
    ? isMember && chosen.mem != null
      ? chosen.mem
      : chosen.pub
    : 0;
  const n = chosen?.f === "print" ? qty : 1;
  const total = unit * n + (chosen?.f === "print" ? shipping : 0);
  const shipOk =
    chosen?.f !== "print" ||
    (ship.name.trim() && ship.address.trim() && ship.city.trim());

  const order = async () => {
    if (!chosen) return;
    setBusy(true);
    const { error } = await supabase.rpc("publication_order", {
      _pub: p.id,
      _format: chosen.f,
      _quantity: n,
      _ship_name: ship.name,
      _ship_address: ship.address,
      _ship_city: ship.city,
      _ship_phone: ship.phone,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.ordered);
    qc.invalidateQueries({ queryKey: myOrdersKey(user?.id) });
  };

  return (
    <>
      <SEOHead
        path={`/publications/${p.slug}`}
        title={`${loc(p, "title")} | U.Psy`}
        description={loc(p, "description").slice(0, 160) || t.subtitle}
      />
      <div className="container-custom py-10 md:py-14 space-y-8">
        <Link
          to={addLocalePrefix("/publications", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.all}
        </Link>
        <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
          <div className="aspect-[3/4] rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
            {p.cover_url ? (
              <img
                src={p.cover_url}
                alt={loc(p, "title")}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-5 max-w-xl">
            <header className="space-y-2">
              <h1 className="text-3xl font-display">{loc(p, "title")}</h1>
              <p className="text-sm text-muted-foreground">
                {[
                  p.author && t.by(p.author),
                  p.pages && t.pages(p.pages),
                  p.isbn && `ISBN ${p.isbn}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </header>
            {loc(p, "description") && (
              <p className="whitespace-pre-line">{loc(p, "description")}</p>
            )}

            <section className="space-y-3 rounded-2xl border border-border p-4">
              <p className="text-sm font-medium">{t.choose}</p>
              {versions.map((v) => (
                <label
                  key={v.f}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pub-format"
                      checked={chosen?.f === v.f}
                      onChange={() => setFormat(v.f)}
                    />
                    {t.formats[v.f]}
                  </span>
                  <span className="flex flex-col items-end">
                    <span
                      className={
                        isMember && v.mem != null
                          ? "line-through text-muted-foreground text-xs"
                          : "font-medium"
                      }
                    >
                      {t.mad(v.pub)}
                    </span>
                    {v.mem != null && (
                      <span
                        className={
                          isMember
                            ? "font-semibold text-primary"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {withLogo(t.memberPrice)} {t.mad(v.mem)}
                      </span>
                    )}
                  </span>
                </label>
              ))}
              {isMember ? (
                <p className="text-xs text-primary flex items-center gap-2">
                  <LsspmLogo className="h-5 w-5" /> {t.memberApplied}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{t.memberHint}</p>
              )}

              {!user ? (
                <Button asChild className="w-full">
                  <Link
                    to={`${addLocalePrefix("/auth", locale)}?redirect=${encodeURIComponent(
                      addLocalePrefix(`/publications/${p.slug}`, locale),
                    )}`}
                  >
                    {t.signIn}
                  </Link>
                </Button>
              ) : (
                <>
                  {chosen?.f === "print" && (
                    <div className="grid gap-2">
                      <label className="text-xs text-muted-foreground">
                        {t.quantity}
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={qty}
                          className="mt-1 w-24"
                          onChange={(e) =>
                            setQty(
                              Math.min(
                                50,
                                Math.max(1, Number(e.target.value) || 1),
                              ),
                            )
                          }
                        />
                      </label>
                      <Input
                        placeholder={t.shipName}
                        value={ship.name}
                        onChange={(e) =>
                          setShip({ ...ship, name: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder={t.shipAddress}
                        value={ship.address}
                        maxLength={500}
                        onChange={(e) =>
                          setShip({ ...ship, address: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder={t.shipCity}
                          value={ship.city}
                          onChange={(e) =>
                            setShip({ ...ship, city: e.target.value })
                          }
                        />
                        <Input
                          placeholder={t.shipPhone}
                          value={ship.phone}
                          onChange={(e) =>
                            setShip({ ...ship, phone: e.target.value })
                          }
                        />
                      </div>
                      {shipping > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t.shipping(shipping)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm">{t.total}</span>
                    <span className="text-lg font-semibold">
                      {t.mad(total)}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!chosen || !shipOk || busy}
                    onClick={order}
                  >
                    {t.order}
                  </Button>
                </>
              )}
            </section>
            <MyOrders publicationId={p.id} />
          </div>
        </div>
      </div>
    </>
  );
}
