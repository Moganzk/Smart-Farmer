/**
 * Simple utility function to format dates as relative time (e.g. "2 hours ago")
 * @param {Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
const TimeAgo = (date) => {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000); // years
  
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000); // months
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400); // days
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600); // hours
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60); // minutes
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  if (seconds < 10) {
    return 'just now';
  }
  
  return `${Math.floor(seconds)} seconds ago`;
};

export default TimeAgo;