// src/utils/dateUtils.ts

/**
 * Format a date string or timestamp into a human-readable format
 * @param date Date string or timestamp
 * @returns Formatted date string
 */
export const formatDate = (date: string | number | Date): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date to show how long ago it was
 * @param date Date to format
 * @returns String representing how long ago the date was
 */
export const formatRelativeTime = (date: string | number | Date): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};
