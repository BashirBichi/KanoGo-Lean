import { Bus, MapPin, QrCode, Clock, Navigation, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bus,
      title: "Book Tickets",
      description: "Reserve your seat for any route",
      action: () => navigate("/book"),
      variant: "hero" as const,
    },
    {
      icon: MapPin,
      title: "Track Live",
      description: "See buses in real-time",
      action: () => navigate("/map"),
      variant: "track" as const,
    },
    {
      icon: QrCode,
      title: "My Passes",
      description: "View your digital tickets",
      action: () => navigate("/passes"),
      variant: "success" as const,
    },
  ];

  const stats = [
    { label: "Active Routes", value: "47", icon: Navigation },
    { label: "Daily Trips", value: "1,250", icon: Bus },
    { label: "On Time", value: "94%", icon: Clock },
    { label: "Verified", value: "100%", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">TransitFlow</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Smart Transit
              <span className="block text-primary">Made Simple</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book tickets, track buses in real-time, and navigate your city with ease. 
              Your digital transit companion for modern urban mobility.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group hover:shadow-strong transition-all duration-300 hover:-translate-y-1 border-0 shadow-soft"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-primary/10 to-accent/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button 
                    variant={feature.variant}
                    size="lg"
                    onClick={feature.action}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-soft bg-gradient-to-r from-primary to-accent text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Transit Network Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-white/20 mb-3">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Why Choose TransitFlow?</h3>
            <p className="text-muted-foreground">Experience the future of public transportation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Real-Time Tracking",
                description: "Know exactly where your bus is with live GPS tracking",
                icon: MapPin,
              },
              {
                title: "QR Code Boarding",
                description: "Skip the lines with contactless digital passes",
                icon: QrCode,
              },
              {
                title: "Route Optimization",
                description: "Smart routing based on live traffic conditions",
                icon: Navigation,
              },
              {
                title: "Secure Payments",
                description: "Safe and encrypted payment processing",
                icon: Shield,
              },
              {
                title: "24/7 Service",
                description: "Round-the-clock customer support",
                icon: Clock,
              },
              {
                title: "Multi-Route Support",
                description: "Connect anywhere in the city seamlessly",
                icon: Bus,
              },
            ].map((feature, index) => (
              <Card key={feature.title} className="border-0 shadow-soft hover:shadow-strong transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;