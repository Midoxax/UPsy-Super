import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Trash2,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ConnectedAccountsCard from "@/components/auth/ConnectedAccountsCard";
import { collectMyData, downloadJson } from "@/lib/compliance/dataExport";
import { COMPANY } from "@/content/legal/company";

type RequestType = "rectification" | "restriction" | "objection";

const COPY = {
  en: {
    title: "My data & privacy",
    intro:
      "Under Moroccan Law 09-08 and the GDPR you can access, export, correct and delete your personal data, or limit how it is used. You can do it here, or by email at",
    exportTitle: "Download my data",
    exportDesc:
      "Everything stored about you, as one JSON file: account, health records, bookings, payments, messages.",
    exportBtn: "Download",
    exportDone: "Your file has been downloaded.",
    otherTitle: "Another request",
    otherDesc:
      "Ask us to correct your data, limit its use, or stop a use you object to.",
    types: {
      rectification: "Correct my data",
      restriction: "Limit how my data is used",
      objection: "Object to a use of my data",
    },
    detailsLabel: "Details",
    detailsPlaceholder: "What should we change or stop?",
    sendBtn: "Send request",
    deleteTitle: "Delete my account",
    deleteDesc: "Ask us to close your account and delete your personal data.",
    deleteBtn: "Request deletion",
    confirmTitle: "Request account deletion?",
    confirmBody: [
      "We check the request comes from you, then delete your account and personal data within 30 days. We confirm by email.",
      "Your clinical records (session notes, questionnaires, intake forms) must by law be kept for 10 years after your last activity. Until then they are locked: no one can open them except your own specialist, and they are deleted automatically at the end of that period.",
      "Invoices are kept for the period accounting law requires.",
    ],
    cancel: "Cancel",
    confirm: "Request deletion",
    sent: "Request received. We will reply by email within 30 days.",
    myRequests: "My requests",
    due: "reply due",
    kinds: {
      access: "Access",
      rectification: "Correction",
      erasure: "Deletion",
      portability: "Copy of data",
      restriction: "Limitation",
      objection: "Objection",
    } as Record<string, string>,
    statuses: {
      received: "Received",
      in_progress: "In progress",
      fulfilled: "Done",
      refused: "Refused",
    } as Record<string, string>,
    error: "Something went wrong",
  },
  fr: {
    title: "Mes données et confidentialité",
    intro:
      "Conformément à la loi 09-08 et au RGPD, tu peux accéder à tes données personnelles, les exporter, les corriger, les supprimer ou en limiter l'utilisation. Ici, ou par e-mail à",
    exportTitle: "Télécharger mes données",
    exportDesc:
      "Tout ce que nous conservons à ton sujet, dans un fichier JSON : compte, dossiers de santé, réservations, paiements, messages.",
    exportBtn: "Télécharger",
    exportDone: "Ton fichier a été téléchargé.",
    otherTitle: "Autre demande",
    otherDesc:
      "Demande-nous de corriger tes données, d'en limiter l'utilisation ou d'arrêter une utilisation à laquelle tu t'opposes.",
    types: {
      rectification: "Corriger mes données",
      restriction: "Limiter l'utilisation de mes données",
      objection: "M'opposer à une utilisation",
    },
    detailsLabel: "Précisions",
    detailsPlaceholder: "Que devons-nous modifier ou arrêter ?",
    sendBtn: "Envoyer la demande",
    deleteTitle: "Supprimer mon compte",
    deleteDesc:
      "Demande-nous de fermer ton compte et de supprimer tes données personnelles.",
    deleteBtn: "Demander la suppression",
    confirmTitle: "Demander la suppression du compte ?",
    confirmBody: [
      "Nous vérifions que la demande vient bien de toi, puis supprimons ton compte et tes données personnelles sous 30 jours. Nous te le confirmons par e-mail.",
      "La loi impose de conserver tes dossiers cliniques (notes de séance, questionnaires, formulaires d'accueil) 10 ans après ta dernière activité. D'ici là, ils sont verrouillés : seul ton spécialiste peut les consulter, et ils sont supprimés automatiquement à la fin de cette période.",
      "Les factures sont conservées pendant la durée imposée par la loi comptable.",
    ],
    cancel: "Annuler",
    confirm: "Demander la suppression",
    sent: "Demande reçue. Nous te répondrons par e-mail sous 30 jours.",
    myRequests: "Mes demandes",
    due: "réponse avant le",
    kinds: {
      access: "Accès",
      rectification: "Correction",
      erasure: "Suppression",
      portability: "Copie des données",
      restriction: "Limitation",
      objection: "Opposition",
    } as Record<string, string>,
    statuses: {
      received: "Reçue",
      in_progress: "En cours",
      fulfilled: "Traitée",
      refused: "Refusée",
    } as Record<string, string>,
    error: "Une erreur est survenue",
  },
  ar: {
    title: "بياناتي وخصوصيتي",
    intro:
      "وفقاً للقانون 09-08 واللائحة الأوروبية لحماية البيانات، يمكنك الاطلاع على بياناتك الشخصية وتصديرها وتصحيحها وحذفها أو تقييد استخدامها. من هنا، أو عبر البريد الإلكتروني",
    exportTitle: "تنزيل بياناتي",
    exportDesc:
      "كل ما نحتفظ به عنك في ملف JSON واحد: الحساب والسجلات الصحية والحجوزات والمدفوعات والرسائل.",
    exportBtn: "تنزيل",
    exportDone: "تم تنزيل ملفك.",
    otherTitle: "طلب آخر",
    otherDesc:
      "اطلب منا تصحيح بياناتك أو تقييد استخدامها أو إيقاف استخدام تعترض عليه.",
    types: {
      rectification: "تصحيح بياناتي",
      restriction: "تقييد استخدام بياناتي",
      objection: "الاعتراض على استخدام بياناتي",
    },
    detailsLabel: "التفاصيل",
    detailsPlaceholder: "ما الذي يجب تغييره أو إيقافه؟",
    sendBtn: "إرسال الطلب",
    deleteTitle: "حذف حسابي",
    deleteDesc: "اطلب منا إغلاق حسابك وحذف بياناتك الشخصية.",
    deleteBtn: "طلب الحذف",
    confirmTitle: "طلب حذف الحساب؟",
    confirmBody: [
      "نتحقق من أن الطلب صادر عنك، ثم نحذف حسابك وبياناتك الشخصية خلال 30 يوماً، ونؤكد ذلك عبر البريد الإلكتروني.",
      "يفرض القانون الاحتفاظ بسجلاتك السريرية (ملاحظات الجلسات والاستبيانات واستمارات الاستقبال) لمدة 10 سنوات بعد آخر نشاط لك. حتى ذلك الحين تبقى مقفلة، لا يطّلع عليها إلا أخصائيك، وتُحذف تلقائياً عند انتهاء هذه المدة.",
      "تُحفظ الفواتير طوال المدة التي يفرضها قانون المحاسبة.",
    ],
    cancel: "إلغاء",
    confirm: "طلب الحذف",
    sent: "تم استلام طلبك. سنرد عليك عبر البريد الإلكتروني خلال 30 يوماً.",
    myRequests: "طلباتي",
    due: "الرد قبل",
    kinds: {
      access: "اطلاع",
      rectification: "تصحيح",
      erasure: "حذف",
      portability: "نسخة من البيانات",
      restriction: "تقييد",
      objection: "اعتراض",
    } as Record<string, string>,
    statuses: {
      received: "مستلم",
      in_progress: "قيد المعالجة",
      fulfilled: "تمت المعالجة",
      refused: "مرفوض",
    } as Record<string, string>,
    error: "حدث خطأ",
  },
};

const DataPrivacyTab = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const c = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [details, setDetails] = useState("");

  const requests = useQuery({
    queryKey: ["my-data-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_subject_requests")
        .select("id, request_type, status, created_at, due_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const fail = (e: unknown) =>
    toast({
      title: c.error,
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const payload = await collectMyData(user);
      downloadJson(
        payload,
        `upsy-data-export-${new Date().toISOString().slice(0, 10)}.json`,
      );
      toast({ title: c.exportDone });
    } catch (e) {
      fail(e);
    } finally {
      setExporting(false);
    }
  };

  // Every request is a formal data_subject_requests row (30-day deadline,
  // handled from /admin/audit) plus a support ticket, so the team is alerted
  // in the inbox it already watches.
  const submit = async (type: RequestType | "erasure", note: string) => {
    if (!user) return;
    setSending(true);
    try {
      const { error } = await supabase.from("data_subject_requests").insert({
        user_id: user.id,
        email: user.email ?? "",
        request_type: type,
        notes: note || null,
      });
      if (error) throw error;

      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: `Data request: ${type}`,
          priority: type === "erasure" ? "high" : "normal",
          category: "account",
        })
        .select()
        .single();
      if (!ticketError && ticket) {
        await supabase.from("support_ticket_messages").insert({
          ticket_id: ticket.id,
          author_id: user.id,
          author_role: "user",
          body:
            `${user.email} filed a ${type} request (Law 09-08 / GDPR). ` +
            `Handle it from Admin > Audit > data subject requests.` +
            (note ? `\n\n${note}` : ""),
        });
      }

      toast({ title: c.sent });
      setRequestType("");
      setDetails("");
      queryClient.invalidateQueries({ queryKey: ["my-data-requests"] });
    } catch (e) {
      fail(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConnectedAccountsCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {c.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {c.intro}{" "}
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-foreground underline underline-offset-2"
            >
              {COMPANY.email}
            </a>
            .
          </p>

          <Separator />

          {/* Export */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{c.exportTitle}</p>
              <p className="text-xs text-muted-foreground">{c.exportDesc}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {c.exportBtn}
            </Button>
          </div>

          <Separator />

          {/* Other rights */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">{c.otherTitle}</p>
              <p className="text-xs text-muted-foreground">{c.otherDesc}</p>
            </div>
            <Select
              value={requestType}
              onValueChange={(v) => setRequestType(v as RequestType)}
            >
              <SelectTrigger aria-label={c.otherTitle}>
                <SelectValue placeholder={c.otherTitle} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(c.types) as RequestType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {c.types[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {requestType && (
              <div className="space-y-2">
                <Label htmlFor="dsr-details">{c.detailsLabel}</Label>
                <Textarea
                  id="dsr-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={c.detailsPlaceholder}
                  rows={3}
                />
                <Button
                  size="sm"
                  disabled={sending || details.trim().length < 5}
                  onClick={() => submit(requestType, details.trim())}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {c.sendBtn}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Delete */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">
                {c.deleteTitle}
              </p>
              <p className="text-xs text-muted-foreground">{c.deleteDesc}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  {c.deleteBtn}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {c.confirmTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2">
                      {c.confirmBody.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{c.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => submit("erasure", "")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {c.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {(requests.data?.length ?? 0) > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">{c.myRequests}</p>
                <ul className="space-y-2">
                  {requests.data!.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span>{c.kinds[r.request_type] ?? r.request_type}</span>
                      <Badge variant="outline">
                        {c.statuses[r.status] ?? r.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString(locale)}
                        {r.status === "received" || r.status === "in_progress"
                          ? ` · ${c.due} ${new Date(r.due_at).toLocaleDateString(locale)}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacyTab;
