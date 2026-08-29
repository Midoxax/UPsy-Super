import { createContext, useContext, ReactNode } from "react";

type PreviewRole = "psychologist" | "user" | "organization" | "athlete" | "coach";

interface PreviewCtx {
  isPreview: boolean;
  previewRole: PreviewRole | null;
  previewUserId: string | null;
}

const Ctx = createContext<PreviewCtx>({
  isPreview: false,
  previewRole: null,
  previewUserId: null,
});

export const useAdminPreview = () => useContext(Ctx);

export function AdminPreviewProvider({
  role,
  userId = null,
  children,
}: {
  role: PreviewRole;
  userId?: string | null;
  children: ReactNode;
}) {
  return (
    <Ctx.Provider value={{ isPreview: true, previewRole: role, previewUserId: userId }}>
      {children}
    </Ctx.Provider>
  );
}