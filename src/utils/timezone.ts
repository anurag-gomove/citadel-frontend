
import { format, differenceInDays } from 'date-fns';

export const TIMEZONE = 'America/New_York';

// Ensure dates are displayed correctly without timezone shifts
export const formatLocalDate = (date: string | Date, formatStr: string = 'MMM d, yyyy') => {
  if (!date) return '';
  
  // Create a date object from the input
  const dateObj = new Date(date);
  
  // Extract the date parts from the UTC values to prevent timezone shifts
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  const day = dateObj.getUTCDate();
  
  // Create a new date with the same year, month, day in the local timezone
  const localDate = new Date(year, month, day);
  
  return format(localDate, formatStr);
};

// Format date and time with timezone handling
export const formatLocalDateTime = (date: string | Date, formatStr: string = 'MMM d, yyyy h:mm a') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return format(dateObj, formatStr);
};

// Preserve the exact date string format as entered (YYYY-MM-DD)
// This is critical for preventing any date shifts when saving to database
export const preserveExactDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Simply validate the format is YYYY-MM-DD and return as is
  // No date object creation to avoid any timezone adjustments
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // If the format is not YYYY-MM-DD, return as is
  return dateString;
};

// Convert a date string to a normalized ISO date string (YYYY-MM-DD)
// For display purposes only, not for database storage
export const normalizeDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // For debugging - log the incoming date string
  console.log("normalizeDate input:", dateString);
  
  // If already in YYYY-MM-DD format, just return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Otherwise parse it and format it
  const date = new Date(dateString);
  
  // Extract year, month, day directly without timezone adjustment
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  console.log("normalizeDate output:", result);
  return result;
};

// Check if a payment is late based on the due date
export const isPaymentLate = (dueDate: string | Date): boolean => {
  if (!dueDate) return false;
  
  const today = new Date();
  // Reset time to midnight for date comparison only
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  // Reset time to midnight for date comparison only
  dueDateObj.setHours(0, 0, 0, 0);
  
  return dueDateObj < today;
};

// Calculate how many days late a payment is
export const getDaysLate = (dueDate: string | Date): number => {
  if (!dueDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  if (dueDateObj >= today) return 0;
  
  return differenceInDays(today, dueDateObj);
};
