import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, Users, CreditCard, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;

interface BookingModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = "details" | "payment" | "success";

const BookingModal = ({ movie, isOpen, onClose }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>("details");
  const [seats, setSeats] = useState(1);
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("18:00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalAmount = (movie.price || 250) * seats;
  const availableSeats = movie.available_seats || 100;

  const showTimes = ["10:00", "13:00", "16:00", "18:00", "21:00"];

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

    if (!showDate) {
      toast({
        title: "Select Date",
        description: "Please select a show date.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const booking = await createBooking({
        movie_id: movie.id,
        seats,
        total_amount: totalAmount,
        show_date: showDate,
        show_time: showTime,
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
    setStep("details");
    setSeats(1);
    setShowDate("");
    setShowTime("18:00");
    setBookingId(null);
    onClose();
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === "success" ? "Booking Confirmed!" : `Book ${movie.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === "details" && (
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

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4" />
                Select Date
              </Label>
              <Input
                type="date"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
                min={minDate}
                className="bg-secondary"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4" />
                Select Time
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {showTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setShowTime(time)}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      showTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {time}
                  </button>
                ))}
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

        {step === "payment" && (
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
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{showDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">{showTime}</span>
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

        {step === "success" && (
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
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{showDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">{showTime}</span>
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
