/**
 * getDisplayName — shared utility for consistent user identity across admin tables.
 *
 * Rules:
 *  - Mill Owner → businessDetails.businessName if set, else fullName
 *  - Farmer / any other role → fullName
 *  - Always falls back to '—' if nothing is available
 */
export const getDisplayName = (user = {}) => {
  const role = (user.role || '').toLowerCase();
  if (role === 'mill_owner') {
    return (
      user.businessDetails?.businessName ||
      user.fullName ||
      '—'
    );
  }
  return user.fullName || '—';
};
