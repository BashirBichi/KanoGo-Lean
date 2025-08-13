import { useState } from "react";
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, fare } = location.state || {};
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    paymentMethod: "card",
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingData) {
    navigate("/book");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const passData = {
      id: `TF${Date.now()}`,
      ...bookingData,
      fare,
      status: "Valid",
      qrData: `TF${Date.now()}|BUS001|${bookingData.date}T${bookingData.time}`
    };
    
    toast.success("Payment successful! Your pass has been generated.");
    navigate("/passes", { state: { newPass: passData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/book")} size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Secure Payment</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{bookingData.from} → {bookingData.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-medium">{bookingData.passengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passenger Name</span>
                  <span className="font-medium">{bookingData.name}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₦{fare}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-0 shadow-strong">
            <CardHeader className="bg-gradient-success text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={paymentData.paymentMethod} 
                    onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="mobile">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentData.paymentMethod === "card" && (
                  <>
                    {/* Card Number */}
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        required
                      />
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        required
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Security Notice */}
                <Card className="border-dashed border-2 border-success/50 bg-success/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-medium text-success mb-1">Secure Payment</h4>
                        <p className="text-sm text-muted-foreground">
                          Your payment information is encrypted and secure. We use industry-standard security measures.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="success"
                  size="xl"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Pay ₦{fare} & Get Pass
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payment;