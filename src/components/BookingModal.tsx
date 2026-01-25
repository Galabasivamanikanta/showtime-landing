import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Users, CreditCard, CheckCircle, MapPin, ArrowLeft } from "lucide-react";
import TheaterShowtimes from "./TheaterShowtimes";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;
type Showtime = Tables<"showtimes">;

interface BookingModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = "select-showtime" | "details" | "payment" | "success";

interface SelectedShowtime {
  showtime: Showtime;
  theaterName: string;
  theaterLocation: string;
}

const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>("select-showtime");
  const [seats, setSeats] = useState(1);
  const [showDate, setShowDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState<SelectedShowtime | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ticketPrice = selectedShowtime?.showtime.price || movie.price || 250;
  const totalAmount = ticketPrice * seats;
  const availableSeats = selectedShowtime?.showtime.available_seats || movie.available_seats || 100;

  const handleShowtimeSelect = (showtime: Showtime, theaterName: string, theaterLocation: string) => {
    setSelectedShowtime({ showtime, theaterName, theaterLocation });
    setStep("details");
  };

  const handleBookingSubmit = async () => {
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

    if (!selectedShowtime) {
      toast({
        title: "Select Showtime",
        description: "Please select a theater and showtime.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const booking = await createBooking({
        movie_id: movie.id,
        theater_id: selectedShowtime.showtime.theater_id,
        showtime_id: selectedShowtime.showtime.id,
        seats,
        total_amount: totalAmount,
        show_date: selectedShowtime.showtime.show_date,
        show_time: selectedShowtime.showtime.show_time,
        status: "pending",
      });

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
    setStep("select-showtime");
    setSeats(1);
    setShowDate("");
    setSelectedShowtime(null);
    setBookingId(null);
    onClose();
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("select-showtime");
      setSelectedShowtime(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            {(step === "details") && (
              <button onClick={handleBack} className="p-1 hover:bg-secondary rounded">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === "success" ? "Booking Confirmed!" : `Book ${movie.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === "select-showtime" && (
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
              </div>
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

        {step === "details" && selectedShowtime && (
          <div className="space-y-5">
            {/* Selected Showtime Summary */}
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <div className="flex gap-4">
                <img
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {movie.genre?.join(", ")}
                  </p>
                  <div className="mt-2 text-sm">
                    <p className="text-foreground font-medium">{selectedShowtime.theaterName}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedShowtime.theaterLocation}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-border">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                  {formatDate(selectedShowtime.showtime.show_date || "")}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                  {formatTime(selectedShowtime.showtime.show_time || "")}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                  ₹{ticketPrice}/ticket
                </span>
              </div>
            </div>

            {/* Seats Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4" />
                Number of Seats ({availableSeats} available)
              </Label>
              <Input
                type="number"
                min={1}
                max={Math.min(10, availableSeats)}
                value={seats}
                onChange={(e) => setSeats(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="bg-secondary"
              />
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
              <span className="text-foreground font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
            </div>

            <Button 
              onClick={handleBookingSubmit} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Booking...
                </>
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
                <span className="text-foreground">{seats}</span>
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
                <span className="text-foreground">{seats}</span>
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
