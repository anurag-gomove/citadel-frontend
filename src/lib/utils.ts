import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateElementWidth(containerWidth: number, percentage: number): number {
  return (containerWidth * percentage) / 100;
}

/**
 * Generates a consistent random rating based on a string seed
 * @param seed String to generate rating from (e.g. property id)
 * @param min Minimum rating value
 * @param max Maximum rating value
 * @returns A rating between min and max with one decimal place
 */
export function generateConsistentRating(seed: string, min = 4.0, max = 5.0): number {
  // Generate a value between 0 and 1 based on the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Normalize to a value between 0 and 1
  const normalizedValue = (hash & 0x7fffffff) / 0x7fffffff;
  
  // Scale to the desired range
  return Math.round((min + normalizedValue * (max - min)) * 10) / 10;
}

/**
 * Converts a UnitPayment object to a format compatible with the RecordPaymentDialog component
 * @param payment The UnitPayment object from the database
 * @returns A payment object compatible with RecordPaymentDialog
 */
export function formatPaymentForDialog(payment: any): {
  id: string;
  expected_amount: number;
  paid_amount: number;
  payment_method: any;
  payment_date: string | null;
  notes: string | null;
  payment_status: string;
} {
  return {
    id: payment.id,
    expected_amount: payment.expected_amount,
    paid_amount: payment.paid_amount || 0,
    payment_method: payment.payment_method,
    payment_date: payment.payment_date,
    notes: payment.notes,
    payment_status: payment.payment_status
  };
}
