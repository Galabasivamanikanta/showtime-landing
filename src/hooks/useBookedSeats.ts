import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BookedSeat {
  seat_row: string;
  seat_number: number;
}

export function useBookedSeats(showtimeId: string | undefined) {
  const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showtimeId) {
      setLoading(false);
      return;
    }

    const fetchBookedSeats = async () => {
      try {
        const { data, error } = await supabase
          .from("booked_seats")
          .select("seat_row, seat_number")
          .eq("showtime_id", showtimeId);

        if (error) throw error;
        setBookedSeats(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch booked seats");
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSeats();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`booked-seats-${showtimeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booked_seats",
          filter: `showtime_id=eq.${showtimeId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newSeat = payload.new as BookedSeat;
            setBookedSeats((prev) => [...prev, newSeat]);
          } else if (payload.eventType === "DELETE") {
            const oldSeat = payload.old as BookedSeat;
            setBookedSeats((prev) =>
              prev.filter(
                (s) => !(s.seat_row === oldSeat.seat_row && s.seat_number === oldSeat.seat_number)
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId]);

  const isSeatBooked = (row: string, number: number): boolean => {
    return bookedSeats.some((s) => s.seat_row === row && s.seat_number === number);
  };

  return { bookedSeats, loading, error, isSeatBooked };
}

export async function bookSeats(
  showtimeId: string,
  bookingId: string,
  seats: { row: string; number: number }[]
) {
  const seatsToInsert = seats.map((seat) => ({
    showtime_id: showtimeId,
    booking_id: bookingId,
    seat_row: seat.row,
    seat_number: seat.number,
  }));

  const { data, error } = await supabase
    .from("booked_seats")
    .insert(seatsToInsert)
    .select();

  if (error) throw error;
  return data;
}
