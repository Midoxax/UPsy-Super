import { ShieldCheck } from "lucide-react";

const DataPrivacyNotice = () => (
  <p className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-1.5">
    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
    <span>
      Conformément à la loi 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition au traitement de vos données personnelles.
    </span>
  </p>
);

export default DataPrivacyNotice;
