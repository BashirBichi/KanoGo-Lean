import { useState } from "react";
import { ArrowLeft, QrCode, Download, Share2, Clock, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

// Mock pass data
const mockPasses = {
  active: [
    {
      id: "TF240108001",
      from: "City Center",
      to: "Airport Terminal",
      date: "2024-01-08",
      time: "14:30",
      passengers: 1,
      busNumber: "BUS001",
      fare: 25,
      status: "Valid",
      qrData: "TF240108001|BUS001|2024-01-08T14:30"
    },
    {
      id: "TF240108002",
      from: "University Campus",
      to: "Shopping District", 
      date: "2024-01-09",
      time: "09:00",
      passengers: 2,
      busNumber: "BUS002",
      fare: 50,
      status: "Valid",
      qrData: "TF240108002|BUS002|2024-01-09T09:00"
    }
  ],
  used: [
    {
      id: "TF240107001",
      from: "Hospital District",
      to: "Business Park",
      date: "2024-01-07",
      time: "16:15",
      passengers: 1,
      busNumber: "BUS003",
      fare: 25,
      status: "Used",
      usedAt: "2024-01-07T16:10"
    }
  ]
};

const MyPasses = () => {
  const navigate = useNavigate();
  const [selectedPass, setSelectedPass] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Valid": return "bg-success text-success-foreground";
      case "Used": return "bg-muted text-muted-foreground";
      case "Expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const PassCard = ({ pass, isActive = true }: { pass: any, isActive?: boolean }) => (
    <Card className="border-0 shadow-soft hover:shadow-strong transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">#{pass.id}</CardTitle>
            <p className="text-sm text-muted-foreground">{pass.from} → {pass.to}</p>
          </div>
          <Badge className={getStatusColor(pass.status)}>
            {pass.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(pass.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{pass.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{pass.busNumber}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold">₦{pass.fare}</span>
              <span className="text-muted-foreground ml-1">
                ({pass.passengers} pax)
              </span>
            </div>
          </div>

          {/* Used timestamp for completed passes */}
          {pass.usedAt && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Used on {new Date(pass.usedAt).toLocaleString()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {isActive && (
              <Button 
                variant="hero" 
                size="sm" 
                onClick={() => setSelectedPass(pass.id)}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">My Passes</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Active Passes ({mockPasses.active.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Travel History ({mockPasses.used.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {mockPasses.active.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockPasses.active.map((pass) => (
                  <PassCard key={pass.id} pass={pass} isActive={true} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-8 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active passes</h3>
                  <p className="text-muted-foreground mb-4">Book a ticket to get started</p>
                  <Button variant="hero" onClick={() => navigate("/book")}>
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {mockPasses.used.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockPasses.used.map((pass) => (
                  <PassCard key={pass.id} pass={pass} isActive={false} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No travel history</h3>
                  <p className="text-muted-foreground">Your completed trips will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        {selectedPass && (
          <QRCodeDisplay
            passId={selectedPass}
            pass={mockPasses.active.find(p => p.id === selectedPass)}
            onClose={() => setSelectedPass(null)}
          />
        )}
      </main>
    </div>
  );
};

export default MyPasses;