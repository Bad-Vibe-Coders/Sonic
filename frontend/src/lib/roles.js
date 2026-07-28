// Authorization vocabulary, kept deliberately aligned with the backend.
//
// These are the ONLY roles a JWT can carry (backend app/models Role enum:
// admin | manager | agent). The 5 personas in ThemeContext.ROLES
// (supervisor / analyst / exec) are cosmetic "view as" presets for the demo —
// they are never access grants, because the server would not honour them.

export const ROLE_ADMIN = 'admin'
export const ROLE_MANAGER = 'manager'
export const ROLE_AGENT = 'agent'

export const ALL_ROLES = [ROLE_ADMIN, ROLE_MANAGER, ROLE_AGENT]
export const MANAGEMENT = [ROLE_ADMIN, ROLE_MANAGER]
export const ADMIN_ONLY = [ROLE_ADMIN]

// Where each role lands when it has no business on the route it asked for.
const ROLE_HOME = {
  [ROLE_ADMIN]: '/app/admin',
  [ROLE_MANAGER]: '/app/supervisor',
  [ROLE_AGENT]: '/app/agent',
}

// Falls back to the most-restricted landing page for an unrecognised role, so a
// future backend role can never accidentally inherit an admin destination.
export const homeFor = (role) => ROLE_HOME[role] || '/app/agent'
