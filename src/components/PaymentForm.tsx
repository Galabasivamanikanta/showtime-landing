import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";

type PaymentMethod = "debit" | "credit" | "upi";

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const PaymentForm = ({ 
  totalAmount, 
  onPaymentSuccess, 
  isProcessing, 
  setIsProcessing 
}: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("debit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    onPaymentSuccess();
  };

  const isCardFormValid = () => {
    return (
      cardNumber.replace(/\s/g, "").length === 16 &&
      cardName.length > 2 &&
      expiry.length === 5 &&
      cvv.length >= 3
    );
  };

  const isUpiFormValid = () => {
    return upiId.includes("@") && upiId.length > 5;
  };

  const isFormValid = () => {
    if (paymentMethod === "upi") return isUpiFormValid();
    return isCardFormValid();
  };

  return (
    <div className="space-y-5">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">Select Payment Method</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          className="grid grid-cols-3 gap-3"
        >
          <Label
            htmlFor="debit"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "debit"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="debit" id="debit" className="sr-only" />
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium text-foreground">Debit Card</span>
          </Label>

          <Label
            htmlFor="credit"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "credit"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="credit" id="credit" className="sr-only" />
            <CreditCard className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-medium text-foreground">Credit Card</span>
          </Label>

          <Label
            htmlFor="upi"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "upi"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="upi" id="upi" className="sr-only" />
            <Smartphone className="w-6 h-6 text-green-500" />
            <span className="text-xs font-medium text-foreground">UPI</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {(paymentMethod === "debit" || paymentMethod === "credit") && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-foreground">
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-foreground">
                  Cardholder Name
                </Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-foreground">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-foreground">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    maxLength={4}
                    className="bg-secondary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentMethod === "upi" && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-foreground">
                  UPI ID
                </Label>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-secondary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID (e.g., name@paytm, name@gpay, name@phonepe)
              </p>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing || !isFormValid()}
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
      </form>

      {/* Security Note */}
      <p className="text-xs text-center text-muted-foreground">
        🔒 Your payment information is secure and encrypted
      </p>
    </div>
  );
};

export default PaymentForm;
