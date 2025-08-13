import { useState } from "react";
import { ArrowLeft, Bus, Users, MapPin, TrendingUp, Clock, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Bookings Today",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Active Buses",
      value: "42",
      change: "3 offline",
      icon: Bus,
      color: "text-success"
    },
    {
      title: "Revenue Today",
      value: "₦31,175",
      change: "+8%",
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "On-Time Performance",
      value: "94%",
      change: "+2%",
      icon: Clock,
      color: "text-success"
    }
  ];

  const routes = [
    {
      id: "RT001",
      name: "City Center ↔ Airport",
      activeBuses: 8,
      totalCapacity: 320,
      currentOccupancy: 245,
      status: "Normal",
      avgDelay: 2
    },
    {
      id: "RT002", 
      name: "University ↔ Shopping District",
      activeBuses: 6,
      totalCapacity: 210,
      currentOccupancy: 185,
      status: "High Demand",
      avgDelay: 5
    },
    {
      id: "RT003",
      name: "Hospital ↔ Business Park", 
      activeBuses: 5,
      totalCapacity: 200,
      currentOccupancy: 120,
      status: "Normal",
      avgDelay: 1
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "BUS003 reporting mechanical issue on Route RT001",
      time: "2 min ago"
    },
    {
      id: 2,
      type: "info",
      message: "Peak hour traffic detected on University route",
      time: "5 min ago"
    },
    {
      id: 3,
      type: "success",
      message: "New bus BUS045 successfully added to fleet",
      time: "1 hour ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "bg-success text-success-foreground";
      case "High Demand": return "bg-warning text-warning-foreground";
      case "Delayed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertTriangle;
      case "info": return Clock;
      case "success": return Shield;
      default: return AlertTriangle;
    }
  };

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
              <h1 className="text-xl font-bold">Transit Admin Dashboard</h1>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              Live Updates
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="border-0 shadow-soft hover:shadow-strong transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-success">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="routes">Route Management</TabsTrigger>
            <TabsTrigger value="buses">Fleet Status</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-6">
            <Card className="border-0 shadow-strong">
              <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Active Routes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {routes.map((route) => (
                    <Card key={route.id} className="border shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{route.name}</h3>
                              <Badge className={getStatusColor(route.status)}>
                                {route.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Route ID: {route.id} • {route.activeBuses} active buses • Avg delay: {route.avgDelay}min
                            </p>
                          </div>
                          
                          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Occupancy</div>
                              <div className="font-semibold">
                                {route.currentOccupancy}/{route.totalCapacity}
                              </div>
                              <Progress 
                                value={(route.currentOccupancy / route.totalCapacity) * 100} 
                                className="w-20 mt-1"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="success" size="sm">
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buses">
            <Card className="border-0 shadow-strong">
              <CardHeader className="bg-gradient-success text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Fleet Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Fleet Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed fleet management features will be available here
                  </p>
                  <Button variant="hero">
                    Add New Bus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="border-0 shadow-strong">
              <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <Card key={alert.id} className="border shadow-soft">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                              alert.type === 'info' ? 'bg-primary/10 text-primary' :
                              'bg-success/10 text-success'
                            }`}>
                              <AlertIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">{alert.time}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;