import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyDocs } from "@/content/legal/privacy";

const Privacy = () => <LegalDocument path="/privacy" docs={privacyDocs} />;

export default Privacy;
