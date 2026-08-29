// Internal CRM landing — the acquisition command surface. Admin-gated by the
// route and, independently, by admin-only RLS on every crm_* table.

import SEOHead from "@/components/SEOHead";
import CrmManager from "@/components/admin/CrmManager";

const AdminCRM = () => (
  <main className="flex-1">
    <SEOHead path="/admin/crm" title="CRM — U.Psy internal" description="Internal acquisition and contact command surface." />
    <div className="container-custom py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Internal</p>
        <h1 className="text-3xl md:text-4xl font-heading mt-1">CRM</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          One contact record per person, across every funnel — with the consent state that decides
          whether we may reach them.
        </p>
      </header>
      <CrmManager />
    </div>
  </main>
);

export default AdminCRM;
