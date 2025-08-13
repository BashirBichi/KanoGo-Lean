import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Users, Shield, AlertCircle, CheckCircle, Navigation, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock ticket data - in real app this would come from API
const mockTickets = [
  { id: "TCK001", busId: "BUS001", userId: "user123", route: "City Center → Airport Terminal" },
  { id: "TCK002", busId: "BUS002", userId: "user456", route: "University → Shopping District" },
  { id: "TCK003", busId: "BUS003", userId: "user789", route: "Hospital → Business Park" },
];

// Mock route data for Kano city
const mockRoutes = [
  {
    id: "ROUTE001",
    name: "City Center → Airport Terminal",
    color: "#3B82F6",
    waypoints: [
      { name: "Central Market", coordinates: [12.0022, 8.5920] },
      { name: "Kano State University", coordinates: [12.0122, 8.6020] },
      { name: "Murtala Mohammed Way", coordinates: [12.0322, 8.6120] },
      { name: "Airport Junction", coordinates: [12.0522, 8.6220] },
      { name: "Airport Terminal", coordinates: [12.0622, 8.6320] },
    ]
  },
  {
    id: "ROUTE002",
    name: "University → Shopping District",
    color: "#10B981",
    waypoints: [
      { name: "Bayero University", coordinates: [12.0122, 8.6020] },
      { name: "Zoo Road", coordinates: [11.9922, 8.5820] },
      { name: "Ibrahim Taiwo Road", coordinates: [11.9822, 8.5720] },
      { name: "City Mall", coordinates: [11.9722, 8.5620] },
    ]
  },
  {
    id: "ROUTE003",
    name: "Hospital → Business Park",
    color: "#F59E0B",
    waypoints: [
      { name: "Murtala Hospital", coordinates: [11.9922, 8.5820] },
      { name: "Government House", coordinates: [12.0022, 8.5920] },
      { name: "Business District", coordinates: [12.0222, 8.6020] },
      { name: "Industrial Area", coordinates: [12.0422, 8.6120] },
    ]
  }
];

// Mock bus data with real-time positions and route assignments
const mockBuses = [
  {
    id: "BUS001",
    route: "City Center → Airport Terminal",
    routeId: "ROUTE001",
    currentLocation: "Central Market",
    coordinates: [12.0022, 8.5920],
    status: "On Time",
    capacity: 40,
    occupied: 28,
    driver: "Ahmed Kano",
    lastUpdate: new Date(),
    waypointIndex: 0,
    direction: 1 // 1 for forward, -1 for backward
  },
  {
    id: "BUS002", 
    route: "University → Shopping District",
    routeId: "ROUTE002",
    currentLocation: "Bayero University",
    coordinates: [12.0122, 8.6020],
    status: "On Time",
    capacity: 35,
    occupied: 15,
    driver: "Fatima Abdullahi",
    lastUpdate: new Date(),
    waypointIndex: 0,
    direction: 1
  },
  {
    id: "BUS003",
    route: "Hospital → Business Park",
    routeId: "ROUTE003",
    currentLocation: "Murtala Hospital",
    coordinates: [11.9922, 8.5820],
    status: "Delayed",
    capacity: 45,
    occupied: 32,
    driver: "Ibrahim Musa",
    lastUpdate: new Date(),
    waypointIndex: 0,
    direction: 1
  }
];

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [ticketId, setTicketId] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userBus, setUserBus] = useState<any>(null);
  const [buses, setBuses] = useState(mockBuses);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Check if user came from track page with busId
  useEffect(() => {
    if (location.state?.busId) {
      const bus = buses.find(b => b.id === location.state.busId);
      if (bus) {
        setSelectedBus(bus);
        setIsAdmin(true); // Assume admin access from track page
        setIsValidated(true);
      }
    }
  }, [location.state, buses]);

  // Animate buses along their routes
  useEffect(() => {
    if (!isValidated) return;

    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          const route = mockRoutes.find(r => r.id === bus.routeId);
          if (!route) return bus;

          const currentWaypoint = route.waypoints[bus.waypointIndex];
          const nextWaypointIndex = bus.direction === 1 
            ? (bus.waypointIndex + 1) % route.waypoints.length
            : bus.waypointIndex === 0 
              ? route.waypoints.length - 1 
              : bus.waypointIndex - 1;
          
          const nextWaypoint = route.waypoints[nextWaypointIndex];
          
          // Calculate movement towards next waypoint
          const latDiff = nextWaypoint.coordinates[0] - currentWaypoint.coordinates[0];
          const lngDiff = nextWaypoint.coordinates[1] - currentWaypoint.coordinates[1];
          const moveSpeed = 0.0002; // Adjust speed as needed
          
          const newLat = bus.coordinates[0] + (latDiff * moveSpeed);
          const newLng = bus.coordinates[1] + (lngDiff * moveSpeed);
          
          // Check if bus reached the waypoint
          const distance = Math.sqrt(
            Math.pow(newLat - nextWaypoint.coordinates[0], 2) + 
            Math.pow(newLng - nextWaypoint.coordinates[1], 2)
          );
          
          let updatedBus = { ...bus };
          
          if (distance < 0.0005) { // Reached waypoint
            updatedBus = {
              ...bus,
              coordinates: nextWaypoint.coordinates,
              currentLocation: nextWaypoint.name,
              waypointIndex: nextWaypointIndex,
              lastUpdate: new Date()
            };
            
            // Change direction at start/end waypoints
            if (nextWaypointIndex === 0 || nextWaypointIndex === route.waypoints.length - 1) {
              updatedBus.direction *= -1;
            }
          } else {
            updatedBus = {
              ...bus,
              coordinates: [newLat, newLng],
              lastUpdate: new Date()
            };
          }
          
          return updatedBus;
        })
      );
    }, 2000); // Update every 2 seconds for smooth animation

    return () => clearInterval(interval);
  }, [isValidated]);

  const validateTicket = () => {
    if (!ticketId.trim()) {
      toast({
        title: "Invalid Ticket",
        description: "Please enter a valid ticket ID",
        variant: "destructive"
      });
      return;
    }

    // Check for admin access
    if (ticketId.toLowerCase() === "admin123") {
      setIsAdmin(true);
      setIsValidated(true);
      toast({
        title: "Admin Access Granted",
        description: "You can now track all buses"
      });
      return;
    }

    // Validate user ticket
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      const bus = buses.find(b => b.id === ticket.busId);
      if (bus) {
        setUserBus(bus);
        setIsValidated(true);
        setSelectedBus(bus);
        toast({
          title: "Ticket Validated",
          description: `Tracking your bus: ${bus.id}`
        });
      }
    } else {
      toast({
        title: "Invalid Ticket",
        description: "Ticket ID not found. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  const handleBusSelect = (bus: any) => {
    if (isAdmin) {
      setSelectedBus(bus);
    }
  };

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Bus Tracking Map</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-strong">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Access Verification</CardTitle>
                <p className="text-muted-foreground">
                  Enter your ticket ID to track your bus or admin credentials to view all buses
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ticketId">Ticket ID</Label>
                  <Input
                    id="ticketId"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter ticket ID (e.g., TCK001)"
                    className="mt-1"
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Demo Credentials:</strong><br />
                    • User tickets: TCK001, TCK002, TCK003<br />
                    • Admin access: admin123
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={validateTicket}
                  className="w-full"
                  size="lg"
                >
                  Verify & Access Map
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Live Bus Tracking</h1>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  User
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  {isAdmin ? "All Buses" : "Your Bus"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(isAdmin ? buses : userBus ? [userBus] : []).map((bus) => (
                    <div
                      key={bus.id}
                      onClick={() => handleBusSelect(bus)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedBus?.id === bus.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{bus.id}</span>
                        <Badge 
                          className={bus.status === "On Time" 
                            ? "bg-success text-success-foreground" 
                            : "bg-warning text-warning-foreground"
                          }
                        >
                          {bus.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bus.route}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{bus.occupied}/{bus.capacity} passengers</span>
                        <span>Driver: {bus.driver}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-0">
                <div className="relative h-96 lg:h-[600px] bg-muted rounded-lg overflow-hidden">
                  {/* Interactive Map with Routes and Animated Buses */}
                  <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-primary/10">
                    {/* Background Map Grid */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-grid-pattern"></div>
                    </div>
                    
                    {/* Route Lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      {mockRoutes.map((route, routeIndex) => (
                        <g key={route.id}>
                          {route.waypoints.map((waypoint, index) => {
                            if (index === route.waypoints.length - 1) return null;
                            const nextWaypoint = route.waypoints[index + 1];
                            
                            // Calculate SVG coordinates (simplified mapping)
                            const x1 = ((waypoint.coordinates[0] - 11.9) * 1000) % 100 + 50;
                            const y1 = ((waypoint.coordinates[1] - 8.5) * 800) % 80 + 40;
                            const x2 = ((nextWaypoint.coordinates[0] - 11.9) * 1000) % 100 + 50;
                            const y2 = ((nextWaypoint.coordinates[1] - 8.5) * 800) % 80 + 40;
                            
                            return (
                              <line
                                key={`${route.id}-${index}`}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke={route.color}
                                strokeWidth="3"
                                strokeDasharray="5,5"
                                className="animate-pulse"
                              />
                            );
                          })}
                          
                          {/* Route Waypoints */}
                          {route.waypoints.map((waypoint, index) => {
                            const x = ((waypoint.coordinates[0] - 11.9) * 1000) % 100 + 50;
                            const y = ((waypoint.coordinates[1] - 8.5) * 800) % 80 + 40;
                            
                            return (
                              <circle
                                key={`${route.id}-waypoint-${index}`}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="4"
                                fill={route.color}
                                className="drop-shadow-lg"
                              />
                            );
                          })}
                        </g>
                      ))}
                    </svg>
                    
                    {/* Animated Bus Icons */}
                    {(isAdmin ? buses : userBus ? [userBus] : []).map((bus) => {
                      const x = ((bus.coordinates[0] - 11.9) * 1000) % 100 + 50;
                      const y = ((bus.coordinates[1] - 8.5) * 800) % 80 + 40;
                      const route = mockRoutes.find(r => r.id === bus.routeId);
                      
                      return (
                        <div
                          key={bus.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-linear"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          <div className={`relative p-2 rounded-full shadow-strong animate-pulse ${
                            selectedBus?.id === bus.id ? 'ring-2 ring-white' : ''
                          }`} style={{ backgroundColor: route?.color || '#3B82F6' }}>
                            <Bus className="h-4 w-4 text-white" />
                            {bus.status === "Delayed" && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          {selectedBus?.id === bus.id && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-strong px-2 py-1 text-xs whitespace-nowrap">
                              {bus.id} - {bus.currentLocation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Map Info */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-strong">
                        <h3 className="font-semibold text-sm mb-2">Kano Mass Transit</h3>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>City Center ↔ Airport</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>University ↔ Shopping</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span>Hospital ↔ Business</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Update Indicator */}
                  {selectedBus && (
                    <div className="absolute top-4 right-4">
                      <Card className="border-0 shadow-strong bg-success text-success-foreground">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                            Live Tracking
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Bus Info Overlay */}
                  {selectedBus && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Card className="border-0 shadow-strong bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{selectedBus.id}</h4>
                              <p className="text-sm text-muted-foreground">{selectedBus.currentLocation}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {selectedBus.occupied}/{selectedBus.capacity}
                              </div>
                              <div className="text-xs text-muted-foreground">passengers</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Access Info */}
        <Card className="border-0 shadow-soft mt-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <span className="font-medium">
                  {isAdmin ? "Admin Access Active" : `Tracking Permission: ${ticketId}`}
                </span>
                <p className="text-sm text-muted-foreground">
                  {isAdmin 
                    ? "You can view and track all buses in the system" 
                    : "You can only track the bus associated with your ticket"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Map;