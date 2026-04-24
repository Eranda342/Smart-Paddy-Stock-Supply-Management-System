/**
 * getCurrentUser — reads the authenticated user object from localStorage.
 * Single source of truth for all components that need user identity
 * without a context or API call.
 *
 * Always returns a stable shape so callers never need to guard against
 * undefined on the core string fields.
 */
export const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || { fullName: '', email: '', role: '' };
  } catch {
    return { fullName: '', email: '', role: '' };
  }
};
