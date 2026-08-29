import { Shield, FileText, AlertCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PoliciesDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Policies & Terms
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-h3">Practice Policies</SheetTitle>
          <SheetDescription>
            Important information about your session and our professional standards
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Cancellation Policy */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <X className="w-5 h-5 text-secondary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Cancellation Policy</h3>
            </div>
            <div className="pl-13 space-y-3 text-body text-muted-foreground">
              <p>
                <strong className="text-foreground">Free cancellation:</strong> Cancel or reschedule up to 24 hours before your appointment with no charge.
              </p>
              <p>
                <strong className="text-foreground">Late cancellation:</strong> Cancellations within 24 hours of your session will be charged 50% of the session fee.
              </p>
              <p>
                <strong className="text-foreground">No-show:</strong> Missed appointments without prior notice will be charged the full session fee.
              </p>
              <Badge variant="outline" className="bg-secondary/5 border-secondary/20">
                Emergency exceptions may apply
              </Badge>
            </div>
          </div>

          {/* Confidentiality */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Confidentiality</h3>
            </div>
            <div className="pl-13 space-y-3 text-body text-muted-foreground">
              <p>
                All sessions are <strong className="text-foreground">strictly confidential</strong> and protected under professional ethical codes and GDPR regulations.
              </p>
              <p>
                <strong className="text-foreground">What stays confidential:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Everything discussed during sessions</li>
                <li>Your personal information and contact details</li>
                <li>Session notes and clinical records</li>
                <li>The fact that you are receiving services</li>
              </ul>
              <p>
                <strong className="text-foreground">Legal exceptions:</strong> Confidentiality may be broken only in cases of imminent danger to self or others, child abuse, or court orders.
              </p>
            </div>
          </div>

          {/* Emergency Note */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Emergency Support</h3>
            </div>
            <div className="pl-13 space-y-3 text-body text-muted-foreground">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="font-semibold text-destructive mb-2">
                  This is not an emergency service
                </p>
                <p className="text-sm">
                  If you are experiencing a mental health emergency or are in immediate danger, please contact emergency services or a crisis hotline immediately.
                </p>
              </div>
              <p>
                <strong className="text-foreground">Morocco Crisis Resources:</strong>
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-secondary">•</span>
                  <span><strong>Emergency:</strong> 141 (Samu)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-secondary">•</span>
                  <span><strong>National Crisis Hotline:</strong> 080 200 0000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-secondary">•</span>
                  <span><strong>Response time:</strong> Non-urgent inquiries typically answered within 24-48 hours</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Professional Standards */}
          <div className="space-y-3 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Professional Standards</h3>
            <div className="text-body text-muted-foreground space-y-2">
              <p>
                All U.Psy-accredited psychologists adhere to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Evidence-based therapeutic approaches</li>
                <li>Continuous professional development</li>
                <li>Ethical codes of conduct</li>
                <li>Cultural competency and inclusivity</li>
                <li>Regular clinical supervision</li>
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
