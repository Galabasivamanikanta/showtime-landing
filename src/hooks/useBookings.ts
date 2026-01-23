import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;
type BookingInsert = TablesInsert<"bookings">;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "bookings",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((booking) =>
                booking.id === (payload.new as Booking).id ? (payload.new as Booking) : booking
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) =>
              prev.filter((booking) => booking.id !== (payload.old as Booking).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createBooking = async (bookingData: Omit<BookingInsert, "user_id">) => {
    if (!user) throw new Error("You must be logged in to create a booking");

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...bookingData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateBookingStatus = async (bookingId: string, status: "pending" | "paid" | "cancelled") => {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, "cancelled");
  };

  return { bookings, loading, error, createBooking, updateBookingStatus, cancelBooking };
}
