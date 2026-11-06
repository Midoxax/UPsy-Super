/** Roles that must sign in with a second factor (TOTP) to use the platform. */
export const MFA_ROLES = ["admin", "psychologist"] as const;

export const needsMfa = (roles: readonly string[]) =>
  roles.some((r) => (MFA_ROLES as readonly string[]).includes(r));
