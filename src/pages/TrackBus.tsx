import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Navigation, Bus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

// Mock bus data - in a real app this would come from an API
const mockBuses = [
  {
    id: "BUS001",
    route: "City Center → Airport Terminal",
    currentLocation: "Downtown Station",
    nextStop: "Central Plaza",
    eta: "3 min",
    capacity: 40,
    occupied: 28,
    status: "On Time",
    coordinates: [40.7128, -74.0060]
  },
  {
    id: "BUS002", 
    route: "University → Shopping District",
    currentLocation: "University Campus",
    nextStop: "Library Square",
    eta: "7 min",
    capacity: 35,
    occupied: 15,
    status: "On Time",
    coordinates: [40.7589, -73.9851]
  },
  {
    id: "BUS003",
    route: "Hospital → Business Park",
    currentLocation: "Medical Center",
    nextStop: "Metro Junction",
    eta: "12 min",
    capacity: 45,
    occupied: 32,
    status: "Delayed",
    coordinates: [40.7505, -73.9934]
  }
];

const TrackBus = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState("");
  const [buses, setBuses] = useState(mockBuses);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => ({
          ...bus,
          eta: Math.max(1, parseInt(bus.eta) - 1) + " min",
          occupied: Math.min(bus.capacity, bus.occupied + Math.floor(Math.random() * 3) - 1)
        }))
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const routes = ["All Routes", ...Array.from(new Set(buses.map(bus => bus.route)))];
  const filteredBuses = selectedRoute && selectedRoute !== "All Routes" 
    ? buses.filter(bus => bus.route === selectedRoute)
    : buses;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time": return "bg-success text-success-foreground";
      case "Delayed": return "bg-warning text-warning-foreground";
      case "Arrived": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOccupancyColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage < 50) return "text-success";
    if (percentage < 80) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Live Bus Tracking</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Route Filter */}
        <Card className="border-0 shadow-soft mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="font-medium">Filter by Route:</span>
              </div>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a route to track" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route} value={route}>{route}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bus List */}
        <div className="space-y-4">
          {filteredBuses.map((bus, index) => (
            <Card 
              key={bus.id} 
              className="border-0 shadow-soft hover:shadow-strong transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bus.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">{bus.route}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(bus.status)}>
                    {bus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <div className="font-medium text-sm">Current Location</div>
                      <div className="text-sm text-muted-foreground">{bus.currentLocation}</div>
                    </div>
                  </div>

                  {/* Next Stop */}
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-accent mt-1" />
                    <div>
                      <div className="font-medium text-sm">Next Stop</div>
                      <div className="text-sm text-muted-foreground">
                        {bus.nextStop} • ETA {bus.eta}
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm">Capacity</div>
                      <div className={`text-sm font-medium ${getOccupancyColor(bus.occupied, bus.capacity)}`}>
                        {bus.occupied}/{bus.capacity} passengers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Route Progress</span>
                    <span>{Math.floor((bus.occupied / bus.capacity) * 100)}% occupied</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${60 + Math.random() * 30}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="track" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/map", { state: { busId: bus.id } })}
                  >
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBuses.length === 0 && (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8 text-center">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No buses found</h3>
              <p className="text-muted-foreground">Try selecting a different route or check back later.</p>
            </CardContent>
          </Card>
        )}

        {/* Real-time Update Indicator */}
        <div className="fixed bottom-4 right-4">
          <Card className="border-0 shadow-strong bg-success text-success-foreground animate-pulse-glow">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                Live Tracking Active
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TrackBus;