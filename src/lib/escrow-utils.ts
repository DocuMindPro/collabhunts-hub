import { supabase } from "@/integrations/supabase/client";
import {
  calculateDeposit,
  calculatePlatformFee,
  calculateCreatorEarnings,
  type EscrowStatus,
} from "@/config/packages";

export interface EscrowTransaction {
  id: string;
  event_booking_id: string;
  amount_cents: number;
  transaction_type: "deposit" | "release" | "refund";
  status: "pending" | "processed" | "failed";
  processed_at: string | null;
  created_at: string;
}

/**
 * Create a deposit transaction for an event booking
 */
export async function createDepositTransaction(
  bookingId: string,
  totalPriceCents: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const depositAmount = calculateDeposit(totalPriceCents);

    const { error } = await supabase.from("escrow_transactions").insert({
      event_booking_id: bookingId,
      amount_cents: depositAmount,
      transaction_type: "deposit",
      status: "pending",
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error creating deposit transaction:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark deposit as paid and update booking status
 */
export async function markDepositPaid(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update escrow transaction
    const { error: txError } = await supabase
      .from("escrow_transactions")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("event_booking_id", bookingId)
      .eq("transaction_type", "deposit");

    if (txError) throw txError;

    // Update booking escrow status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        escrow_status: "deposit_paid",
        payment_status: "partial",
      })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    return { success: true };
  } catch (error: any) {
    console.error("Error marking deposit paid:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Release payment to creator after successful event
 */
export async function releasePayment(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("total_price_cents, deposit_amount_cents")
      .eq("id", bookingId)
      .single();

    if (fetchError) throw fetchError;
    if (!booking) throw new Error("Booking not found");

    const remainingAmount =
      booking.total_price_cents - (booking.deposit_amount_cents || 0);

    // Create release transaction
    const { error: txError } = await supabase.from("escrow_transactions").insert({
      event_booking_id: bookingId,
      amount_cents: remainingAmount,
      transaction_type: "release",
      status: "processed",
      processed_at: new Date().toISOString(),
    });

    if (txError) throw txError;

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        escrow_status: "completed",
        payment_status: "paid",
        status: "completed",
      })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    return { success: true };
  } catch (error: any) {
    console.error("Error releasing payment:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Process refund for cancelled event
 */
export async function processRefund(
  bookingId: string,
  refundPercentage: number = 100
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get booking and transaction details
    const { data: transactions, error: fetchError } = await supabase
      .from("escrow_transactions")
      .select("amount_cents")
      .eq("event_booking_id", bookingId)
      .eq("transaction_type", "deposit")
      .eq("status", "processed");

    if (fetchError) throw fetchError;

    const depositPaid = transactions?.reduce(
      (sum, tx) => sum + tx.amount_cents,
      0
    ) || 0;
    const refundAmount = Math.round(depositPaid * (refundPercentage / 100));

    // Create refund transaction
    const { error: txError } = await supabase.from("escrow_transactions").insert({
      event_booking_id: bookingId,
      amount_cents: refundAmount,
      transaction_type: "refund",
      status: "processed",
      processed_at: new Date().toISOString(),
    });

    if (txError) throw txError;

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        escrow_status: "refunded",
        payment_status: "refunded",
        status: "cancelled",
      })
      .eq("id", bookingId);

    if (bookingError) throw bookingError;

    return { success: true };
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get escrow summary for a booking
 */
export async function getEscrowSummary(bookingId: string): Promise<{
  totalPaid: number;
  depositAmount: number;
  releaseAmount: number;
  refundAmount: number;
  platformFee: number;
  creatorEarnings: number;
  status: EscrowStatus;
} | null> {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("total_price_cents, escrow_status")
      .eq("id", bookingId)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) return null;

    const { data: transactions, error: txError } = await supabase
      .from("escrow_transactions")
      .select("*")
      .eq("event_booking_id", bookingId);

    if (txError) throw txError;

    const depositAmount =
      transactions
        ?.filter((tx) => tx.transaction_type === "deposit" && tx.status === "processed")
        .reduce((sum, tx) => sum + tx.amount_cents, 0) || 0;

    const releaseAmount =
      transactions
        ?.filter((tx) => tx.transaction_type === "release" && tx.status === "processed")
        .reduce((sum, tx) => sum + tx.amount_cents, 0) || 0;

    const refundAmount =
      transactions
        ?.filter((tx) => tx.transaction_type === "refund" && tx.status === "processed")
        .reduce((sum, tx) => sum + tx.amount_cents, 0) || 0;

    const platformFee = calculatePlatformFee(booking.total_price_cents);
    const creatorEarnings = calculateCreatorEarnings(booking.total_price_cents);

    return {
      totalPaid: depositAmount + releaseAmount - refundAmount,
      depositAmount,
      releaseAmount,
      refundAmount,
      platformFee,
      creatorEarnings,
      status: booking.escrow_status as EscrowStatus,
    };
  } catch (error: any) {
    console.error("Error getting escrow summary:", error);
    return null;
  }
}

/**
 * Format escrow status for display
 */
export function getEscrowStatusDisplay(status: EscrowStatus): {
  label: string;
  color: "yellow" | "blue" | "green" | "red" | "orange";
} {
  const statusMap: Record<EscrowStatus, { label: string; color: "yellow" | "blue" | "green" | "red" | "orange" }> = {
    pending_deposit: { label: "Awaiting Deposit", color: "yellow" },
    deposit_paid: { label: "Deposit Received", color: "blue" },
    completed: { label: "Payment Released", color: "green" },
    refunded: { label: "Refunded", color: "red" },
    disputed: { label: "Under Dispute", color: "orange" },
  };

  return statusMap[status] || { label: status, color: "yellow" };
}
