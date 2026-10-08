export function formatTimeAgo(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export function formatExpiryRemaining(expiryTimestamp: string | null | undefined): {
  label: string;
  isUrgent: boolean;
  hours: number | null;
} {
  if (!expiryTimestamp) {
    return { label: 'No expiry data', isUrgent: false, hours: null };
  }

  const expiry = new Date(expiryTimestamp);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours <= 0) {
    return { label: 'Expired', isUrgent: true, hours: 0 };
  }
  if (diffHours < 24) {
    return { label: `${diffHours}h remaining`, isUrgent: true, hours: diffHours };
  }
  const days = Math.round(diffHours / 24);
  if (days === 1) {
    return { label: 'Expires tomorrow', isUrgent: true, hours: diffHours };
  }
  return { label: `${days} days left`, isUrgent: days <= 2, hours: diffHours };
}

export function formatClockTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
