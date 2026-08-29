import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, Check, MessageCircle, Mail, Smartphone } from "lucide-react";

interface ShareBookingLinkCardProps {
  slug?: string | null;
  isPublished?: boolean;
}

export const ShareBookingLinkCard = ({ slug, isPublished }: ShareBookingLinkCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://upsy.ma";
  const link = useMemo(() => (slug ? `${origin}/b/${slug}` : ""), [origin, slug]);

  const message = `Hi! You can book a session with me directly here: ${link}`;

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share it with your client." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  if (!slug) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4 text-primary" />
            Your booking link
          </CardTitle>
          <CardDescription>
            Save your profile first to generate a personal booking link.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("Book a session with me")}&body=${encodeURIComponent(message)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(message)}`;

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" />
          Your booking link
        </CardTitle>
        <CardDescription>
          Share this link by WhatsApp, email, or SMS — clients land directly on your calendar.
          {!isPublished && (
            <span className="block mt-1 text-amber-600 text-xs">
              Heads up: your profile isn't published yet, so the link won't be reachable until you publish.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input readOnly value={link} className="bg-background font-mono text-xs" />
          <Button type="button" onClick={copyLink} variant="outline" size="sm" className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" size="sm" variant="outline">
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </a>
          </Button>
          <Button asChild type="button" size="sm" variant="outline">
            <a href={mailUrl}>
              <Mail className="h-4 w-4 mr-1.5" />
              Email
            </a>
          </Button>
          <Button asChild type="button" size="sm" variant="outline">
            <a href={smsUrl}>
              <Smartphone className="h-4 w-4 mr-1.5" />
              SMS
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
