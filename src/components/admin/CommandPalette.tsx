import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { Users, Award, Calendar, FileCheck, Building2, BarChart3, DollarSign, Globe, Database } from "lucide-react";

interface Props {
  onTabChange: (tab: string) => void;
}

export const CommandPalette = ({ onTabChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data: results } = useQuery({
    queryKey: ["admin-cmdk", search],
    enabled: open && search.length >= 2,
    queryFn: async () => {
      const term = `%${search}%`;
      const [psy, apps, users, bookings] = await Promise.all([
        supabase.from("psychologist_profiles").select("id,full_name,city,slug").ilike("full_name", term).limit(5),
        supabase.from("psychologist_applications").select("id,full_name,email,status").or(`full_name.ilike.${term},email.ilike.${term}`).limit(5),
        supabase.from("profiles").select("id,full_name").ilike("full_name", term).limit(5),
        supabase.from("bookings").select("id,scheduled_at,status").limit(0), // placeholder; bookings rarely searched by id
      ]);
      return {
        psychologists: psy.data ?? [],
        applications: apps.data ?? [],
        users: users.data ?? [],
      };
    },
  });

  const go = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search users, psychologists, applications…  (Ctrl+K)" value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>{search.length < 2 ? "Type to search…" : "No results."}</CommandEmpty>

        <CommandGroup heading="Jump to tab">
          <CommandItem onSelect={() => go("overview")}><BarChart3 className="mr-2 h-4 w-4" /> Overview</CommandItem>
          <CommandItem onSelect={() => go("psychologists")}><Users className="mr-2 h-4 w-4" /> Psychologists</CommandItem>
          <CommandItem onSelect={() => go("bookings")}><Calendar className="mr-2 h-4 w-4" /> Bookings</CommandItem>
          <CommandItem onSelect={() => go("users")}><Users className="mr-2 h-4 w-4" /> Users</CommandItem>
          <CommandItem onSelect={() => go("accreditation")}><Award className="mr-2 h-4 w-4" /> Accreditation</CommandItem>
          <CommandItem onSelect={() => go("org-applications")}><Building2 className="mr-2 h-4 w-4" /> Organisation applications</CommandItem>
          <CommandItem onSelect={() => go("pricing")}><DollarSign className="mr-2 h-4 w-4" /> Pricing</CommandItem>
          <CommandItem onSelect={() => go("transactions")}><Database className="mr-2 h-4 w-4" /> Transactions</CommandItem>
          <CommandItem onSelect={() => go("translations")}><Globe className="mr-2 h-4 w-4" /> Translations</CommandItem>
        </CommandGroup>

        {results?.psychologists?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Psychologists">
              {results.psychologists.map((p: any) => (
                <CommandItem key={p.id} onSelect={() => { navigate(`/psychologists/${p.slug ?? p.id}`); setOpen(false); }}>
                  <Users className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm">{p.full_name}</p>
                    {p.city && <p className="text-xs text-muted-foreground">{p.city}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {results?.applications?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Applications">
              {results.applications.map((a: any) => (
                <CommandItem key={a.id} onSelect={() => go("accreditation")}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm">{a.full_name} <span className="text-xs text-muted-foreground">· {a.status}</span></p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {results?.users?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Users">
              {results.users.map((u: any) => (
                <CommandItem key={u.id} onSelect={() => go("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span className="text-sm">{u.full_name ?? "Anonymous"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;