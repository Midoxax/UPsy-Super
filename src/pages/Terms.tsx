import { LegalDocument } from "@/components/legal/LegalDocument";
import { termsDocs } from "@/content/legal/terms";

const Terms = () => <LegalDocument path="/terms" docs={termsDocs} />;

export default Terms;
