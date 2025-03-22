import { formatDistanceToNowStrict } from 'date-fns';
import numeral from 'numeral';

// Format dates to "5 mins ago", "2 hours ago", etc.
export const formatDate = (date) => {
  if (!date) return '';
  
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
};

// Format numbers for likes, etc. - "1.2k" instead of "1,200"
export const formatNumber = (number) => {
  if (!number) return '0';
  
  return numeral(number).format('0,0.[0]a');
};

// Format names consistently - capitalize first letter of each word
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};