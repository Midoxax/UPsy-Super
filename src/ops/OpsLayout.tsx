import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useParams } from "@/lib/router-compat";
import { Activity, Calendar, Compass, ListChecks, Sparkles, Plus } from "lucide-react";
import { useOpsWorkspaces } from "./hooks/useOps";
import { motion } from "framer-motion";
import "./ops-theme.css";

export const OpsLayout = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const location = useLocation();
  const { workspaces, current } = useOpsWorkspaces(slug);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    document.title = current ? `UPSY OPS · ${current.name}` : "UPSY OPS";
  }, [current]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const base = `/ops/${slug ?? "_"}`;

  const navItems = [
    { to: `${base}/command`, icon: Activity, label: "Command Center" },
    { to: `${base}/events`, icon: Calendar, label: "Events" },
    { to: `${base}/tasks`, icon: ListChecks, label: "Tasks" },
    { to: `${base}/director`, icon: Sparkles, label: "AI Director" },
  ];

  return (
    <div className="ops-theme min-h-screen flex relative">
      {/* Global scanline overlay */}
      <div className="ops-scanline pointer-events-none fixed inset-0 z-[100] opacity-[0.03]" />

      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-white/5 flex flex-col p-5 gap-6 sticky top-0 h-screen relative">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="ops-mono text-[10px] tracking-[0.3em] text-white/40">U.PSY // OPERATIONS</div>
          <div className="ops-display text-2xl mt-1">
            UPSY <span className="ops-accent ops-glow">OPS</span>
          </div>
        </motion.div>

        {/* Workspace selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="ops-glass p-3"
        >
          <div className="ops-label">Active Workspace</div>
          <select
            className="ops-select mt-1"
            value={current?.slug ?? ""}
            onChange={(e) => { window.location.href = `/ops/${e.target.value}/command`; }}
          >
            {workspaces.map(w => (
              <option key={w.id} value={w.slug}>{w.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`ops-nav-item ${isActive ? "active" : ""}`}
              >
                <motion.div
                  className="flex items-center gap-3 w-full relative"
                  initial={false}
                  animate={{ x: isActive ? 4 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-[hsl(var(--ops-accent))]" : "text-white/40"}`} />
                  <span className={isActive ? "text-[hsl(var(--ops-accent))]" : ""}>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[hsl(var(--ops-accent))]"
                      style={{ boxShadow: "0 0 12px hsl(var(--ops-accent))" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* New Protocol CTA */}
        <NavLink
          to={`${base}/events/new`}
          className="ops-btn justify-center mt-auto"
        >
          <Plus className="h-4 w-4" /> New Protocol
        </NavLink>

        {/* Exit */}
        <NavLink to="/ops" className="ops-nav-item">
          <Compass className="h-4 w-4" /> Exit Command
        </NavLink>

        {/* Footer status strip */}
        <div className="mt-4 pt-4 border-t border-white/5 ops-mono text-[9px] text-white/25 space-y-1.5">
          <div className="flex items-center justify-between">
            <span>SYSTEM TIME</span>
            <span className="text-white/50">{time.toLocaleTimeString("en-GB", { hour12: false })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>UPTIME</span>
            <span className="flex items-center gap-1 text-emerald-300/60">
              <span className="h-1 w-1 rounded-full bg-emerald-400 ops-pulse" />
              99.97%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>LATENCY</span>
            <span className="text-white/50">{Math.floor(12 + Math.random() * 18)}ms</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0 relative">
        <div className="ops-grid-bg absolute inset-0 opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OpsLayout;
