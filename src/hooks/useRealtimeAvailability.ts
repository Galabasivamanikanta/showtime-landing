import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SeatCount {
  [showtimeId: string]: number;
}

export function useRealtimeAvailability(showtimeIds: string[]) {
  const [bookedCounts, setBookedCounts] = useState<SeatCount>({});

  useEffect(() => {
    if (showtimeIds.length === 0) return;

    // Fetch initial booked seat counts
    const fetchBookedCounts = async () => {
      const { data, error } = await supabase
        .from("booked_seats")
        .select("showtime_id")
        .in("showtime_id", showtimeIds);

      if (error) {
        console.error("Error fetching booked seats:", error);
        return;
      }

      // Count seats per showtime
      const counts: SeatCount = {};
      showtimeIds.forEach((id) => {
        counts[id] = 0;
      });
      
      data?.forEach((seat) => {
        if (seat.showtime_id) {
          counts[seat.showtime_id] = (counts[seat.showtime_id] || 0) + 1;
        }
      });

      setBookedCounts(counts);
    };

    fetchBookedCounts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("realtime-availability")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booked_seats",
        },
        (payload) => {
          const showtimeId = payload.new.showtime_id as string;
          if (showtimeIds.includes(showtimeId)) {
            setBookedCounts((prev) => ({
              ...prev,
              [showtimeId]: (prev[showtimeId] || 0) + 1,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "booked_seats",
        },
        (payload) => {
          const showtimeId = payload.old.showtime_id as string;
          if (showtimeIds.includes(showtimeId)) {
            setBookedCounts((prev) => ({
              ...prev,
              [showtimeId]: Math.max((prev[showtimeId] || 0) - 1, 0),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeIds.join(",")]);

  const getAvailableSeats = (showtimeId: string, totalSeats: number): number => {
    return Math.max(totalSeats - (bookedCounts[showtimeId] || 0), 0);
  };

  return { bookedCounts, getAvailableSeats };
}
