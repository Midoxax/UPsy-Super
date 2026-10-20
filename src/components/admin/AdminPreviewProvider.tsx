import { createContext, useContext, ReactNode } from "react";

type PreviewRole =
  "psychologist" | "user" | "organization" | "athlete" | "coach";

interface PreviewCtx {
  isPreview: boolean;
  previewRole: PreviewRole | null;
  /** When set, useAuth() inside the preview reports this user, so every
   *  dashboard component loads that person's data (subject to the admin's
   *  own database permissions: clinical tables stay behind break-glass). */
  previewUserId: string | null;
  previewEmail: string | null;
}

const Ctx = createContext<PreviewCtx>({
  isPreview: false,
  previewRole: null,
  previewUserId: null,
  previewEmail: null,
});

export const useAdminPreview = () => useContext(Ctx);

export function AdminPreviewProvider({
  role,
  userId = null,
  email = null,
  children,
}: {
  role: PreviewRole;
  userId?: string | null;
  email?: string | null;
  children: ReactNode;
}) {
  return (
    <Ctx.Provider
      value={{
        isPreview: true,
        previewRole: role,
        previewUserId: userId,
        previewEmail: email,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
