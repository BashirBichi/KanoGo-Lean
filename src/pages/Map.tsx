import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Users, Shield, AlertCircle, CheckCircle, Navigation, Bus } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

// Mock route data for Kano city with real coordinates
const mockRoutes = [
  {
    id: "ROUTE001",
    name: "City Center → Airport Terminal",
    color: "#3B82F6",
    waypoints: [
      { name: "Central Market", coordinates: [8.5167, 12.0022] },
      { name: "Kano State University", coordinates: [8.5267, 12.0122] },
      { name: "Murtala Mohammed Way", coordinates: [8.5367, 12.0222] },
      { name: "Airport Junction", coordinates: [8.5467, 12.0322] },
      { name: "Airport Terminal", coordinates: [8.5567, 12.0422] },
    ]
  },
  {
    id: "ROUTE002",
    name: "University → Shopping District",
    color: "#10B981",
    waypoints: [
      { name: "Bayero University", coordinates: [8.5267, 12.0122] },
      { name: "Zoo Road", coordinates: [8.5067, 11.9922] },
      { name: "Ibrahim Taiwo Road", coordinates: [8.4967, 11.9822] },
      { name: "City Mall", coordinates: [8.4867, 11.9722] },
    ]
  },
  {
    id: "ROUTE003",
    name: "Hospital → Business Park",
    color: "#F59E0B",
    waypoints: [
      { name: "Murtala Hospital", coordinates: [8.5067, 11.9922] },
      { name: "Government House", coordinates: [8.5167, 12.0022] },
      { name: "Business District", coordinates: [8.5267, 12.0222] },
      { name: "Industrial Area", coordinates: [8.5367, 12.0422] },
    ]
  }
];

// Mock bus data with real-time positions and route assignments (coordinates in [lng, lat] format)
const mockBuses = [
  {
    id: "BUS001",
    route: "City Center → Airport Terminal",
    routeId: "ROUTE001",
    currentLocation: "Central Market",
    coordinates: [8.5167, 12.0022],
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
    coordinates: [8.5267, 12.0122],
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
    coordinates: [8.5067, 11.9922],
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
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const busMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});

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
          const lngDiff = nextWaypoint.coordinates[0] - currentWaypoint.coordinates[0];
          const latDiff = nextWaypoint.coordinates[1] - currentWaypoint.coordinates[1];
          const moveSpeed = 0.0002; // Adjust speed as needed
          
          const newLng = bus.coordinates[0] + (lngDiff * moveSpeed);
          const newLat = bus.coordinates[1] + (latDiff * moveSpeed);
          
          // Check if bus reached the waypoint
          const distance = Math.sqrt(
            Math.pow(newLng - nextWaypoint.coordinates[0], 2) + 
            Math.pow(newLat - nextWaypoint.coordinates[1], 2)
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
              coordinates: [newLng, newLat],
              lastUpdate: new Date()
            };
          }
          
          return updatedBus;
        })
      );
    }, 2000); // Update every 2 seconds for smooth animation

    return () => clearInterval(interval);
  }, [isValidated]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!isValidated || !mapboxToken || !mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [8.5167, 12.0022], // Kano city center
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add route lines
    map.current.on('load', () => {
      mockRoutes.forEach((route) => {
        const routeCoordinates = route.waypoints.map(wp => wp.coordinates);
        
        map.current?.addSource(`route-${route.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        map.current?.addLayer({
          id: `route-${route.id}`,
          type: 'line',
          source: `route-${route.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': route.color,
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Add waypoint markers
        route.waypoints.forEach((waypoint, index) => {
          const marker = new mapboxgl.Marker({
            color: route.color,
            scale: 0.8
          })
            .setLngLat(waypoint.coordinates as [number, number])
            .setPopup(new mapboxgl.Popup().setText(waypoint.name))
            .addTo(map.current!);
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [isValidated, mapboxToken]);

  // Update bus markers
  useEffect(() => {
    if (!map.current || !isValidated) return;

    const busesToShow = isAdmin ? buses : userBus ? [userBus] : [];
    
    busesToShow.forEach((bus) => {
      const route = mockRoutes.find(r => r.id === bus.routeId);
      
      if (busMarkers.current[bus.id]) {
        // Update existing marker position
        busMarkers.current[bus.id].setLngLat(bus.coordinates as [number, number]);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${route?.color || '#3B82F6'};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        
        const busIcon = document.createElement('div');
        busIcon.innerHTML = '🚌';
        busIcon.style.fontSize = '16px';
        el.appendChild(busIcon);

        el.addEventListener('click', () => {
          setSelectedBus(bus);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(bus.coordinates as [number, number])
          .setPopup(
            new mapboxgl.Popup()
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${bus.id}</h3>
                  <p class="text-sm">${bus.currentLocation}</p>
                  <p class="text-xs text-gray-600">${bus.occupied}/${bus.capacity} passengers</p>
                </div>
              `)
          )
          .addTo(map.current!);

        busMarkers.current[bus.id] = marker;
      }
    });

    // Remove markers for buses not in current view
    Object.keys(busMarkers.current).forEach(busId => {
      if (!busesToShow.find(b => b.id === busId)) {
        busMarkers.current[busId].remove();
        delete busMarkers.current[busId];
      }
    });
  }, [buses, isAdmin, userBus, isValidated]);

  const initializeMap = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter your Mapbox public token",
        variant: "destructive"
      });
      return;
    }
    setShowTokenInput(false);
  };

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
      setShowTokenInput(true);
      toast({
        title: "Admin Access Granted",
        description: "Please enter your Mapbox token to continue"
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
        setShowTokenInput(true);
        toast({
          title: "Ticket Validated",
          description: "Please enter your Mapbox token to view the map"
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

  if (!isValidated || showTokenInput) {
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
                <CardTitle>
                  {showTokenInput ? "Mapbox Configuration" : "Access Verification"}
                </CardTitle>
                <p className="text-muted-foreground">
                  {showTokenInput 
                    ? "Enter your Mapbox public token to load the real map of Kano"
                    : "Enter your ticket ID to track your bus or admin credentials to view all buses"
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {showTokenInput ? (
                  <>
                    <div>
                      <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
                      <Input
                        id="mapboxToken"
                        type="password"
                        value={mapboxToken}
                        onChange={(e) => setMapboxToken(e.target.value)}
                        placeholder="pk.eyJ1IjoiY..."
                        className="mt-1"
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Get your Mapbox public token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a> → Account → Tokens
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={initializeMap}
                      className="w-full"
                      size="lg"
                    >
                      Load Map
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                <div className="relative">
                  <div 
                    ref={mapRef}
                    className="h-96 lg:h-[600px] bg-muted rounded-lg overflow-hidden"
                    style={{ width: '100%', height: '600px' }}
                  />

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