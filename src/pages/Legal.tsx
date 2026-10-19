import { LegalDocument } from "@/components/legal/LegalDocument";
import { noticeDocs } from "@/content/legal/notice";

const Legal = () => <LegalDocument path="/legal" docs={noticeDocs} />;

export default Legal;
