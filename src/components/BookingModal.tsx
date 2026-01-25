import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { bookSeats } from "@/hooks/useBookedSeats";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Users, CreditCard, CheckCircle, MapPin, ArrowLeft } from "lucide-react";
import TheaterShowtimes from "./TheaterShowtimes";
import SeatSelector from "./SeatSelector";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;
type Showtime = Tables<"showtimes">;

interface BookingModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = "select-tickets" | "select-showtime" | "select-seats" | "payment" | "success";

interface SelectedShowtime {
  showtime: Showtime;
  theaterName: string;
  theaterLocation: string;
}

const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>("select-tickets");
  const [seats, setSeats] = useState(1);
  const [showDate, setShowDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState<SelectedShowtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<{ row: string; number: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ticketPrice = selectedShowtime?.showtime.price || movie.price || 250;
  const totalAmount = ticketPrice * seats;

  const handleTicketCountSubmit = () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be logged in to book tickets.",
        variant: "destructive",
      });
      onClose();
      navigate("/auth");
      return;
    }
    setStep("select-showtime");
  };

  const handleShowtimeSelect = (showtime: Showtime, theaterName: string, theaterLocation: string) => {
    setSelectedShowtime({ showtime, theaterName, theaterLocation });
    setSelectedSeats([]); // Reset seat selection
    setStep("select-seats");
  };

  const handleSeatsConfirm = async () => {
    if (selectedSeats.length !== seats) {
      toast({
        title: "Select All Seats",
        description: `Please select exactly ${seats} seat(s).`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedShowtime) return;

    setIsProcessing(true);
    try {
      const seatLabels = selectedSeats.map((s) => `${s.row}${s.number}`);
      
      const booking = await createBooking({
        movie_id: movie.id,
        theater_id: selectedShowtime.showtime.theater_id,
        showtime_id: selectedShowtime.showtime.id,
        seats,
        total_amount: totalAmount,
        show_date: selectedShowtime.showtime.show_date,
        show_time: selectedShowtime.showtime.show_time,
        status: "pending",
        selected_seats: seatLabels,
      });

      // Book the individual seats
      await bookSeats(selectedShowtime.showtime.id, booking.id, selectedSeats);

      setBookingId(booking.id);
      setStep("payment");

      // Mock email notification
      toast({
        title: "📧 Booking Confirmation Email",
        description: `A confirmation email has been sent for your booking of "${movie.title}".`,
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;

    setIsProcessing(true);

    // Mock payment processing with delay
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your payment.",
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await updateBookingStatus(bookingId, "paid");
      
      setStep("success");

      // Mock payment success notification
      toast({
        title: "💳 Payment Successful!",
        description: `₹${totalAmount} has been charged. Your tickets are confirmed!`,
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep("select-tickets");
    setSeats(1);
    setShowDate("");
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setBookingId(null);
    onClose();
  };

  const handleBack = () => {
    if (step === "select-showtime") {
      setStep("select-tickets");
    } else if (step === "select-seats") {
      setStep("select-showtime");
      setSelectedShowtime(null);
      setSelectedSeats([]);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Default to tomorrow if no date selected
  const effectiveDate = showDate || minDate;

  const formatTime = (time: string) => time.substring(0, 5);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const getStepTitle = () => {
    switch (step) {
      case "select-tickets":
        return `Book ${movie.title}`;
      case "select-showtime":
        return "Select Theater & Time";
      case "select-seats":
        return "Select Your Seats";
      case "payment":
        return "Complete Payment";
      case "success":
        return "Booking Confirmed!";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            {(step === "select-showtime" || step === "select-seats") && (
              <button onClick={handleBack} className="p-1 hover:bg-secondary rounded">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        {step === "select-tickets" && (
          <div className="space-y-5">
            {/* Movie Info */}
            <div className="flex gap-4 p-4 bg-secondary rounded-lg">
              <img
                src={movie.poster_url || "/placeholder.svg"}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-foreground">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {movie.genre?.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {movie.duration_minutes} mins
                </p>
                <p className="text-primary font-semibold mt-2">
                  ₹{movie.price || 250} / ticket
                </p>
              </div>
            </div>

            {/* Seats Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4" />
                How many tickets?
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSeats(num)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      seats === num
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can book up to 6 tickets at a time
              </p>
            </div>

            <Button onClick={handleTicketCountSubmit} className="w-full">
              Select Showtime
            </Button>
          </div>
        )}

        {step === "select-showtime" && (
          <div className="space-y-5">
            {/* Ticket count summary */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Selected Tickets</span>
              <span className="font-semibold text-foreground">{seats} {seats === 1 ? "ticket" : "tickets"}</span>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4" />
                Select Date
              </Label>
              <Input
                type="date"
                value={showDate || minDate}
                onChange={(e) => setShowDate(e.target.value)}
                min={minDate}
                className="bg-secondary"
              />
            </div>

            {/* Theater and Showtime Selection */}
            <TheaterShowtimes
              movieId={movie.id}
              movieTitle={movie.title}
              selectedDate={effectiveDate}
              onSelectShowtime={handleShowtimeSelect}
            />
          </div>
        )}

        {step === "select-seats" && selectedShowtime && (
          <div className="space-y-5">
            {/* Selected showtime summary */}
            <div className="p-3 bg-secondary rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{selectedShowtime.theaterName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedShowtime.theaterLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    {formatDate(selectedShowtime.showtime.show_date || "")}
                  </p>
                  <p className="text-sm text-foreground">
                    {formatTime(selectedShowtime.showtime.show_time || "")}
                  </p>
                </div>
              </div>
            </div>

            {/* Seat Selector */}
            <SeatSelector
              showtimeId={selectedShowtime.showtime.id}
              maxSeats={seats}
              selectedSeats={selectedSeats}
              onSeatsSelected={setSelectedSeats}
            />

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
            </div>

            <Button 
              onClick={handleSeatsConfirm} 
              className="w-full"
              disabled={isProcessing || selectedSeats.length !== seats}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Booking...
                </>
              ) : selectedSeats.length !== seats ? (
                `Select ${seats - selectedSeats.length} more seat(s)`
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        )}

        {step === "payment" && selectedShowtime && (
          <div className="space-y-5">
            <div className="p-4 bg-secondary rounded-lg text-center">
              <CreditCard className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Mock Payment</h3>
              <p className="text-sm text-muted-foreground">
                This is a simulated payment for demo purposes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Movie</span>
                <span className="text-foreground">{movie.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Theater</span>
                <span className="text-foreground">{selectedShowtime.theaterName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{formatDate(selectedShowtime.showtime.show_date || "")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">{formatTime(selectedShowtime.showtime.show_time || "")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground">
                  {selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${totalAmount}`
              )}
            </Button>
          </div>
        )}

        {step === "success" && selectedShowtime && (
          <div className="space-y-5 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your tickets for <strong>{movie.title}</strong> have been booked successfully.
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Theater</span>
                <span className="text-foreground">{selectedShowtime.theaterName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{formatDate(selectedShowtime.showtime.show_date || "")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">{formatTime(selectedShowtime.showtime.show_time || "")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground">
                  {selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-primary font-semibold">₹{totalAmount}</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
