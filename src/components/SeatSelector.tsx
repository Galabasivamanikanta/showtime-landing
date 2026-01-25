import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useBookedSeats } from "@/hooks/useBookedSeats";
import { cn } from "@/lib/utils";

interface SeatSelectorProps {
  showtimeId: string;
  maxSeats: number;
  onSeatsSelected: (seats: { row: string; number: number }[]) => void;
  selectedSeats: { row: string; number: number }[];
}

// Theater configuration
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

const SeatSelector = ({
  showtimeId,
  maxSeats,
  onSeatsSelected,
  selectedSeats,
}: SeatSelectorProps) => {
  const { bookedSeats, loading, error, isSeatBooked } = useBookedSeats(showtimeId);

  const handleSeatClick = (row: string, number: number) => {
    // Check if seat is already booked
    if (isSeatBooked(row, number)) return;

    const seatIndex = selectedSeats.findIndex(
      (s) => s.row === row && s.number === number
    );

    if (seatIndex >= 0) {
      // Deselect seat
      const newSeats = selectedSeats.filter((_, i) => i !== seatIndex);
      onSeatsSelected(newSeats);
    } else if (selectedSeats.length < maxSeats) {
      // Select seat (if under limit)
      onSeatsSelected([...selectedSeats, { row, number }]);
    }
  };

  const isSeatSelected = (row: string, number: number): boolean => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Failed to load seat availability. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Screen indicator */}
      <div className="relative">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        <p className="text-center text-xs text-muted-foreground mt-2">SCREEN</p>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-6 text-xs text-muted-foreground font-medium text-right">
              {row}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((number) => {
                const isBooked = isSeatBooked(row, number);
                const isSelected = isSeatSelected(row, number);
                const canSelect = !isBooked && selectedSeats.length < maxSeats;

                return (
                  <button
                    key={`${row}-${number}`}
                    onClick={() => handleSeatClick(row, number)}
                    disabled={isBooked}
                    className={cn(
                      "w-7 h-7 rounded-t-lg text-xs font-medium transition-all flex items-center justify-center",
                      isBooked && "bg-muted text-muted-foreground cursor-not-allowed",
                      !isBooked && !isSelected && "border-2 border-green-500 text-green-500 hover:bg-green-500/10",
                      isSelected && "bg-primary text-primary-foreground border-2 border-primary",
                      !isBooked && !isSelected && !canSelect && "opacity-50 cursor-not-allowed"
                    )}
                    title={
                      isBooked
                        ? "Seat unavailable"
                        : isSelected
                        ? "Click to deselect"
                        : canSelect
                        ? `Select seat ${row}${number}`
                        : `Maximum ${maxSeats} seats allowed`
                    }
                  >
                    {number}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-xs text-muted-foreground font-medium">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg border-2 border-green-500" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-muted" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      {/* Selection info */}
      <div className="text-center p-3 bg-secondary rounded-lg">
        <p className="text-sm text-foreground">
          Selected: <span className="font-semibold text-primary">{selectedSeats.length}</span> / {maxSeats} seats
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Seats: {selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatSelector;
