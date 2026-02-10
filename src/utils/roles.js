import { useSelector } from "react-redux";

// Define role constants
const ROLES = {
  ADMIN: { id: 1, name: "Admin" },
  MECHANICAL_HEAD: { id: 2, name: "Mechanical Head" },
  MECHANICAL_MANAGER: { id: 3, name: "Mechanical Manager" },
  MECHANICAL_INCHARGE: { id: 4, name: "Site Incharge" },
  MECHANICAL_STORE_MANAGER: { id: 5, name: "Store Manager" },
  PROJECT_MANAGER: { id: 6, name: "Project Manager" },
};

// Create mappings for quick lookups
const ROLE_ID_TO_NAME = Object.fromEntries(
  Object.values(ROLES).map((role) => [role.id, role.name])
);

const ROLE_NAME_TO_ID = Object.fromEntries(
  Object.values(ROLES).map((role) => [role.name, role.id])
);

// Functions to retrieve roles
const getRoleById = (id) => ROLE_ID_TO_NAME[id] || null;

const getIdByRole = (roleName) => ROLE_NAME_TO_ID[roleName] || null;

// Role level classifications
const ADMIN_ROLES = [1, 2, 3];
const SITE_ROLES = [4, 5, 6];

// Hook to get current user's role level
const useUserRoleLevel = () => {
  const user = useSelector((state) => state.auth.user);
  const roleId = user?.roleId;

  if (ADMIN_ROLES.includes(roleId)) return { role: "admin", roleId: roleId, siteId: user?.site?.id, siteName: user?.site?.name };
  if (SITE_ROLES.includes(roleId)) return { role: "site", roleId: roleId, siteId: user?.site?.id, siteName: user?.site?.name };
  return null; // unknown or unauthenticated
};

// Export for reuse
export { ROLES, getRoleById, getIdByRole, useUserRoleLevel };
