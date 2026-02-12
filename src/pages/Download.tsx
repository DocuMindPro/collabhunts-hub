import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Apple, Download as DownloadIcon, ExternalLink, Package, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GITHUB_REPO = "DocuMindPro/collabhunts-hub";
const APP_URL = "https://collabhunts-hub.lovable.app";

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

const Download = () => {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=5`);
        if (response.ok) {
          const releases: GitHubRelease[] = await response.json();
          const releaseWithApk = releases.find(r => r.assets.some(a => a.name.endsWith('.apk')));
          if (releaseWithApk) {
            setLatestRelease(releaseWithApk);
          } else if (releases.length === 0) {
            setError("No releases found yet. Push code to GitHub to trigger the first build.");
          } else {
            setError("No APK file found in recent releases. A new build may be in progress.");
          }
        } else if (response.status === 404) {
          setError("No releases found yet. Push code to GitHub to trigger the first build.");
        } else {
          setError("Could not fetch release information.");
        }
      } catch (err) {
        setError("Could not connect to GitHub. The APK download will be available after the first build.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  const apkAsset = latestRelease?.assets.find(a => a.name.endsWith('.apk'));
  const apkUrl = apkAsset?.browser_download_url;
  const apkSize = apkAsset ? (apkAsset.size / (1024 * 1024)).toFixed(1) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Get Collab Hunts on Your Phone</h1>
          <p className="text-muted-foreground text-lg mb-8 text-center">
            Download the Android app or install directly from your browser
          </p>

          {/* Android APK Download Section */}
          <Card className="mb-8 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Android APK Download
              </CardTitle>
              <CardDescription>
                Download and install the native Android app
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Checking for latest build...</p>
                </div>
              ) : error ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : apkUrl ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCodeSVG 
                      value={apkUrl} 
                      size={180}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Version: {latestRelease?.tag_name} • Size: {apkSize} MB
                    </p>
                    <Button asChild size="lg" className="gap-2">
                      <a href={apkUrl} download>
                        <DownloadIcon className="h-5 w-5" />
                        Download APK
                      </a>
                    </Button>
                  </div>

                  {/* Installation Instructions */}
                  <div className="w-full mt-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4" />
                      Installation Steps
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Scan the QR code or tap "Download APK"</li>
                      <li>Open your phone's <strong>Settings → Security</strong></li>
                      <li>Enable <strong>"Install from Unknown Sources"</strong> for your browser</li>
                      <li>Open the downloaded APK file</li>
                      <li>Tap <strong>"Install"</strong> when prompted</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No APK file found in the latest release. A new build may be in progress.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* PWA Option */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Quick Install (Web App)
              </CardTitle>
              <CardDescription className="text-center">
                Install directly from your browser - no download needed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={APP_URL} 
                  size={160}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              
              <Button asChild variant="outline" className="gap-2">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Web App
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Instructions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* iOS Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Apple className="h-5 w-5" />
                  iPhone / iPad
                </CardTitle>
                <CardDescription>Web App Installation</CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Scan the Web App QR code above</li>
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
                <CardDescription>Native App or Web App</CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-sm font-medium mb-2">Option 1: Native APK (Recommended)</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mb-4">
                  <li>Scan the APK QR code above</li>
                  <li>Enable "Unknown Sources" in Settings</li>
                  <li>Install the downloaded APK</li>
                </ol>
                <p className="text-sm font-medium mb-2">Option 2: Web App</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Scan the Web App QR code</li>
                  <li>Tap menu (⋮) → "Install app"</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="mt-12 p-6 bg-muted/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">Why Use the App?</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">⚡ Instant Access</p>
                <p className="text-muted-foreground">Launch directly from your home screen</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">📱 Full Screen</p>
                <p className="text-muted-foreground">No browser bars - native app experience</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="font-medium">🔔 Notifications</p>
                <p className="text-muted-foreground">Get alerts for messages and bookings</p>
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
