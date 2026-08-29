// Internal finance surface — invoicing, bank-transfer reconciliation and the
// auto-entrepreneur turnover ceiling. Admin-gated by the route and by RLS.

import SEOHead from "@/components/SEOHead";
import FinanceManager from "@/components/admin/FinanceManager";

const AdminFinance = () => (
  <main className="flex-1">
    <SEOHead path="/admin/finance" title="Finance — U.Psy internal" description="Invoicing, reconciliation and revenue tracking." />
    <div className="container-custom py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Internal</p>
        <h1 className="text-3xl md:text-4xl font-heading mt-1">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Gapless invoicing in MAD, direct bank-transfer reconciliation, and an early warning
          on the auto-entrepreneur turnover ceiling.
        </p>
      </header>
      <FinanceManager />
    </div>
  </main>
);

export default AdminFinance;
