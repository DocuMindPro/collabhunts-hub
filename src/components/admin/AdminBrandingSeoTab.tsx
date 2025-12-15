import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Image as ImageIcon, 
  Upload, 
  Save, 
  RefreshCw, 
  Search,
  Share2,
  Globe,
  FileImage,
  Smartphone,
  Loader2,
  Check,
  ExternalLink
} from "lucide-react";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  category: string;
  description: string | null;
  updated_at: string;
}

interface AssetConfig {
  key: string;
  label: string;
  description: string;
  dimensions: string;
  accept: string;
  icon: React.ReactNode;
}

const ASSET_CONFIGS: AssetConfig[] = [
  {
    key: 'logo_primary_url',
    label: 'Primary Logo',
    description: 'Full logo with wordmark',
    dimensions: 'Recommended: 400x100px, SVG or PNG',
    accept: 'image/svg+xml,image/png,image/jpeg',
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    key: 'logo_icon_url',
    label: 'Icon-Only Logo',
    description: 'Square icon without text',
    dimensions: 'Recommended: 512x512px, PNG',
    accept: 'image/png,image/svg+xml',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    key: 'favicon_url',
    label: 'Favicon',
    description: 'Browser tab icon',
    dimensions: 'Required: 32x32px or 16x16px, ICO/PNG',
    accept: 'image/x-icon,image/png,image/ico',
    icon: <FileImage className="h-5 w-5" />,
  },
  {
    key: 'apple_touch_icon_url',
    label: 'Apple Touch Icon',
    description: 'iOS home screen icon',
    dimensions: 'Required: 180x180px, PNG',
    accept: 'image/png',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    key: 'og_image_url',
    label: 'Social Share Image',
    description: 'Image shown when sharing links',
    dimensions: 'Required: 1200x630px, PNG/JPG',
    accept: 'image/png,image/jpeg',
    icon: <Share2 className="h-5 w-5" />,
  },
];

const AdminBrandingSeoTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // SEO form state
  const [seoForm, setSeoForm] = useState({
    site_title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    twitter_card_type: 'summary_large_image',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, SiteSetting> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting;
      });
      setSettings(settingsMap);

      // Populate SEO form
      setSeoForm({
        site_title: settingsMap['site_title']?.value || '',
        meta_description: settingsMap['meta_description']?.value || '',
        keywords: settingsMap['keywords']?.value || '',
        og_title: settingsMap['og_title']?.value || '',
        og_description: settingsMap['og_description']?.value || '',
        twitter_card_type: settingsMap['twitter_card_type']?.value || 'summary_large_image',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (assetConfig: AssetConfig, file: File) => {
    setUploadingKey(assetConfig.key);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', assetConfig.key.replace('_url', ''));
      formData.append('settingKey', assetConfig.key);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-site-asset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [assetConfig.key]: {
          ...prev[assetConfig.key],
          value: result.url,
          updated_at: new Date().toISOString(),
        },
      }));

      toast({
        title: "Success",
        description: `${assetConfig.label} uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSeoSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(seoForm).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "SEO settings saved successfully",
      });

      fetchSettings();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branding Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Branding Assets
          </CardTitle>
          <CardDescription>
            Upload logo files and favicons for consistent branding across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ASSET_CONFIGS.map((config) => {
              const setting = settings[config.key];
              const isUploading = uploadingKey === config.key;
              
              return (
                <Card key={config.key} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {config.description}
                        </p>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/20">
                      {setting?.value ? (
                        <img 
                          src={setting.value} 
                          alt={config.label}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-xs text-muted-foreground">No image</p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{config.dimensions}</p>

                    <input
                      type="file"
                      accept={config.accept}
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[config.key] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(config, file);
                        e.target.value = '';
                      }}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[config.key]?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : setting?.value ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Replace
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>

                    {setting?.value && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={() => window.open(setting.value!, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Full Size
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Configure search engine and social media metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Site Title */}
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={seoForm.site_title}
                onChange={(e) => setSeoForm(prev => ({ ...prev, site_title: e.target.value }))}
                placeholder="CollabHunts - Connect Brands with Creators"
              />
              <p className="text-xs text-muted-foreground">
                {seoForm.site_title.length}/60 characters
                {seoForm.site_title.length > 60 && (
                  <Badge variant="destructive" className="ml-2">Too long</Badge>
                )}
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={seoForm.keywords}
                onChange={(e) => setSeoForm(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="influencer marketing, content creators, UGC"
              />
              <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={seoForm.meta_description}
              onChange={(e) => setSeoForm(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="The easiest way for brands to find and collaborate with content creators..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {seoForm.meta_description.length}/160 characters
              {seoForm.meta_description.length > 160 && (
                <Badge variant="destructive" className="ml-2">Too long</Badge>
              )}
            </p>
          </div>

          <Separator />

          <h4 className="font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Sharing (Open Graph)
          </h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* OG Title */}
            <div className="space-y-2">
              <Label htmlFor="og_title">Social Share Title</Label>
              <Input
                id="og_title"
                value={seoForm.og_title}
                onChange={(e) => setSeoForm(prev => ({ ...prev, og_title: e.target.value }))}
                placeholder="CollabHunts - Connect Brands with Creators"
              />
            </div>

            {/* Twitter Card Type */}
            <div className="space-y-2">
              <Label htmlFor="twitter_card_type">Twitter Card Type</Label>
              <select
                id="twitter_card_type"
                value={seoForm.twitter_card_type}
                onChange={(e) => setSeoForm(prev => ({ ...prev, twitter_card_type: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>

          {/* OG Description */}
          <div className="space-y-2">
            <Label htmlFor="og_description">Social Share Description</Label>
            <Textarea
              id="og_description"
              value={seoForm.og_description}
              onChange={(e) => setSeoForm(prev => ({ ...prev, og_description: e.target.value }))}
              placeholder="Find verified creators ready to collaborate with your brand."
              rows={2}
            />
          </div>

          {/* Preview Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Google Preview */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Google Search Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer truncate">
                    {seoForm.site_title || 'Your Site Title'}
                  </p>
                  <p className="text-xs text-green-700">collabhunts.com</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {seoForm.meta_description || 'Your meta description will appear here...'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Preview */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Social Share Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                    {settings['og_image_url']?.value ? (
                      <img 
                        src={settings['og_image_url'].value} 
                        alt="OG Image"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">collabhunts.com</p>
                    <p className="text-sm font-medium truncate">
                      {seoForm.og_title || 'Social Share Title'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {seoForm.og_description || 'Social share description...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSeoSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save SEO Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrandingSeoTab;