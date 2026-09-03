/**
 * Utility for consistent human-readable date & time formatting
 * Displays exact registration time as required:
 * Example: "September 3, 2026 at 4:23 AM"
 */

export function formatExactRegistrationTime(
  registrationDate?: string,
  registrationTime?: string,
  createdAt?: string
): string {
  // If ISO created_at string is available, parse it
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} at ${timePart}`;
    }
  }

  // If separate registrationDate & registrationTime exist
  if (registrationDate) {
    // Check if registrationDate is already formatted or is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(registrationDate)) {
      const [year, month, day] = registrationDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return registrationTime ? `${datePart} at ${registrationTime}` : datePart;
    }
    return registrationTime ? `${registrationDate} at ${registrationTime}` : registrationDate;
  }

  return 'Recently Registered';
}
