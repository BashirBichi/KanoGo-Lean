import { useEffect, useRef } from "react";
import { X, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  passId: string;
  pass: any;
  onClose: () => void;
}

export const QRCodeDisplay = ({ passId, pass, onClose }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && pass) {
      QRCode.toCanvas(canvasRef.current, pass.qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1a365d', // Primary color
          light: '#ffffff'
        }
      });
    }
  }, [pass]);

  if (!pass) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-strong animate-slide-up">
        <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Digital Pass</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-soft mb-4 inline-block">
            <canvas ref={canvasRef} />
          </div>

          {/* Pass Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pass ID</span>
              <span className="font-mono text-sm">{pass.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Route</span>
              <span className="text-sm">{pass.from} → {pass.to}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bus</span>
              <span className="text-sm font-medium">{pass.busNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date & Time</span>
              <span className="text-sm">{pass.date} at {pass.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-success text-success-foreground">
                {pass.status}
              </Badge>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-accent-light/50 p-3 rounded-lg mb-4">
            <p className="text-xs text-center text-muted-foreground">
              Show this QR code to the inspector when boarding the bus
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};