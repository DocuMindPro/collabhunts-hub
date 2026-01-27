import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Apple, Download as DownloadIcon, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const APP_URL = "https://collabhunts-hub.lovable.app";

const Download = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Get CollabHunts on Your Phone</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Scan the QR code below to open the app on your mobile device, then install it to your home screen for instant access.
          </p>

          {/* QR Code Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <DownloadIcon className="h-5 w-5" />
                Scan to Download
              </CardTitle>
              <CardDescription>
                Point your phone's camera at this QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={APP_URL} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              
              <Button asChild variant="outline" className="gap-2">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Link Directly
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* iOS Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Apple className="h-5 w-5" />
                  iPhone / iPad
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Scan the QR code with your camera</li>
                  <li>Tap the notification to open Safari</li>
                  <li>Tap the <strong>Share</strong> button (box with arrow)</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right</li>
                </ol>
              </CardContent>
            </Card>

            {/* Android Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5" />
                  Android
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Scan the QR code with your camera</li>
                  <li>Open the link in Chrome</li>
                  <li>Tap the <strong>menu</strong> (three dots)</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>"Install"</strong> to confirm</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="mt-12 p-6 bg-muted/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Why Install the App?</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">⚡ Instant Access</p>
                <p className="text-muted-foreground">Launch directly from your home screen</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">📱 Full Screen</p>
                <p className="text-muted-foreground">No browser bars - feels like a native app</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">🔄 Auto Updates</p>
                <p className="text-muted-foreground">Always get the latest features automatically</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Download;
