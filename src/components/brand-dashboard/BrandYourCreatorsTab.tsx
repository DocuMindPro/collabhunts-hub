import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, HeartOff, Star, MapPin, Calendar, DollarSign, MessageSquare, Trash2, Edit2, Plus, FolderOpen, Users, Clock, StickyNote, Search, ExternalLink, Image, Megaphone, CheckSquare, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { canUserUseCRM, getUserSubscriptionTier } from "@/lib/subscription-utils";
import UpgradePrompt from "@/components/UpgradePrompt";
import MassCampaignInviteDialog from "./MassCampaignInviteDialog";

interface SavedCreator {
  id: string;
  creator_profile_id: string;
  folder_name: string;
  created_at: string;
  creator: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
    location_country: string | null;
    categories: string[];
  };
  content_count?: number;
}

interface WorkedWithCreator {
  creator_profile_id: string;
  display_name: string;
  profile_image_url: string | null;
  location_country: string | null;
  categories: string[];
  total_bookings: number;
  total_spent_cents: number;
  last_booking_date: string;
  avg_rating: number | null;
  content_count?: number;
}

interface CreatorNote {
  id: string;
  creator_profile_id: string;
  note_content: string;
  created_at: string;
  updated_at: string;
}

const FOLDER_OPTIONS = ["Favorites", "To Contact", "Fashion", "Tech", "Food", "Travel", "High Priority", "Past Collaborators"];

const BrandYourCreatorsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasCRMAccess, setHasCRMAccess] = useState<boolean | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("basic");
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [workedWithCreators, setWorkedWithCreators] = useState<WorkedWithCreator[]>([]);
  const [notes, setNotes] = useState<CreatorNote[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentCountMap, setContentCountMap] = useState<Record<string, number>>({});
  
  // Mass campaign invite state
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [campaignInviteDialogOpen, setCampaignInviteDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Notes dialog state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedCreatorForNotes, setSelectedCreatorForNotes] = useState<{id: string; name: string} | null>(null);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");

  // Move to folder dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedCreatorToMove, setSelectedCreatorToMove] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check CRM access and subscription tier
      const crmAccess = await canUserUseCRM(user.id);
      setHasCRMAccess(crmAccess);
      
      const tier = await getUserSubscriptionTier(user.id);
      setSubscriptionTier(tier);

      // If no CRM access, stop fetching data
      if (!crmAccess) {
        setLoading(false);
        return;
      }

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) return;
      setBrandProfileId(brandProfile.id);

      // Fetch saved creators with creator details
      const { data: savedData } = await supabase
        .from("saved_creators")
        .select(`
          id,
          creator_profile_id,
          folder_name,
          created_at,
          creator_profiles!inner (
            id,
            display_name,
            profile_image_url,
            location_country,
            categories
          )
        `)
        .eq("brand_profile_id", brandProfile.id)
        .order("created_at", { ascending: false });

      if (savedData) {
        const formattedSaved = savedData.map((s: any) => ({
          id: s.id,
          creator_profile_id: s.creator_profile_id,
          folder_name: s.folder_name,
          created_at: s.created_at,
          creator: {
            id: s.creator_profiles.id,
            display_name: s.creator_profiles.display_name,
            profile_image_url: s.creator_profiles.profile_image_url,
            location_country: s.creator_profiles.location_country,
            categories: s.creator_profiles.categories || []
          }
        }));
        setSavedCreators(formattedSaved);
        
        // Extract unique folders
        const uniqueFolders = [...new Set(formattedSaved.map(s => s.folder_name))];
        setFolders(uniqueFolders);
      }

      // Fetch worked with creators from bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          creator_profile_id,
          total_price_cents,
          created_at,
          status,
          creator_profiles!inner (
            id,
            display_name,
            profile_image_url,
            location_country,
            categories
          )
        `)
        .eq("brand_profile_id", brandProfile.id)
        .in("status", ["completed", "accepted"]);

      if (bookingsData) {
        // Group by creator
        const creatorMap = new Map<string, WorkedWithCreator>();
        
        for (const booking of bookingsData as any[]) {
          const creatorId = booking.creator_profile_id;
          const existing = creatorMap.get(creatorId);
          
          if (existing) {
            existing.total_bookings += 1;
            existing.total_spent_cents += booking.total_price_cents;
            if (new Date(booking.created_at) > new Date(existing.last_booking_date)) {
              existing.last_booking_date = booking.created_at;
            }
          } else {
            creatorMap.set(creatorId, {
              creator_profile_id: creatorId,
              display_name: booking.creator_profiles.display_name,
              profile_image_url: booking.creator_profiles.profile_image_url,
              location_country: booking.creator_profiles.location_country,
              categories: booking.creator_profiles.categories || [],
              total_bookings: 1,
              total_spent_cents: booking.total_price_cents,
              last_booking_date: booking.created_at,
              avg_rating: null
            });
          }
        }

        // Fetch ratings for each creator
        const creatorIds = Array.from(creatorMap.keys());
        if (creatorIds.length > 0) {
          const { data: reviewsData } = await supabase
            .from("reviews")
            .select("creator_profile_id, rating")
            .eq("brand_profile_id", brandProfile.id)
            .in("creator_profile_id", creatorIds);

          if (reviewsData) {
            for (const review of reviewsData) {
              const creator = creatorMap.get(review.creator_profile_id);
              if (creator) {
                creator.avg_rating = review.rating;
              }
            }
          }
        }

        setWorkedWithCreators(Array.from(creatorMap.values()).sort(
          (a, b) => new Date(b.last_booking_date).getTime() - new Date(a.last_booking_date).getTime()
        ));
      }

      // Fetch all notes
      const { data: notesData } = await supabase
        .from("creator_notes")
        .select("*")
        .eq("brand_profile_id", brandProfile.id)
        .order("updated_at", { ascending: false });

      if (notesData) {
        setNotes(notesData);
      }

      // Fetch content count per creator
      const { data: contentData } = await supabase
        .from("content_library")
        .select("creator_profile_id")
        .eq("brand_profile_id", brandProfile.id)
        .not("creator_profile_id", "is", null);

      if (contentData) {
        const countMap: Record<string, number> = {};
        contentData.forEach((item: any) => {
          if (item.creator_profile_id) {
            countMap[item.creator_profile_id] = (countMap[item.creator_profile_id] || 0) + 1;
          }
        });
        setContentCountMap(countMap);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveCreator = async (savedId: string) => {
    try {
      const { error } = await supabase
        .from("saved_creators")
        .delete()
        .eq("id", savedId);

      if (error) throw error;

      setSavedCreators(prev => prev.filter(s => s.id !== savedId));
      toast({ title: "Creator removed from saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMoveToFolder = async (savedId: string, newFolder: string) => {
    try {
      const { error } = await supabase
        .from("saved_creators")
        .update({ folder_name: newFolder })
        .eq("id", savedId);

      if (error) throw error;

      setSavedCreators(prev => prev.map(s => 
        s.id === savedId ? { ...s, folder_name: newFolder } : s
      ));
      
      // Update folders list
      if (!folders.includes(newFolder)) {
        setFolders(prev => [...prev, newFolder]);
      }

      setMoveDialogOpen(false);
      setSelectedCreatorToMove(null);
      setNewFolderName("");
      toast({ title: "Moved to " + newFolder });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddNote = async () => {
    if (!selectedCreatorForNotes || !newNote.trim() || !brandProfileId) return;

    try {
      const { data, error } = await supabase
        .from("creator_notes")
        .insert({
          brand_profile_id: brandProfileId,
          creator_profile_id: selectedCreatorForNotes.id,
          note_content: newNote.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote("");
      toast({ title: "Note added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    try {
      const { error } = await supabase
        .from("creator_notes")
        .update({ note_content: editNoteContent.trim() })
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev => prev.map(n => 
        n.id === noteId ? { ...n, note_content: editNoteContent.trim(), updated_at: new Date().toISOString() } : n
      ));
      setEditingNote(null);
      setEditNoteContent("");
      toast({ title: "Note updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("creator_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({ title: "Note deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openNotesDialog = (creatorId: string, creatorName: string) => {
    setSelectedCreatorForNotes({ id: creatorId, name: creatorName });
    setNotesDialogOpen(true);
  };

  const getCreatorNotes = (creatorId: string) => {
    return notes.filter(n => n.creator_profile_id === creatorId);
  };

  // Filter saved creators by folder and search
  const filteredSavedCreators = savedCreators.filter(s => {
    const matchesFolder = selectedFolder === "all" || s.folder_name === selectedFolder;
    const matchesSearch = !searchQuery || 
      s.creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  // Filter worked with creators by search
  const filteredWorkedWithCreators = workedWithCreators.filter(c => {
    return !searchQuery || 
      c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Mass messaging handlers
  const toggleCreatorSelection = (creatorId: string) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId);
    } else {
      newSelected.add(creatorId);
    }
    setSelectedCreators(newSelected);
  };

  const selectAllVisible = () => {
    const newSelected = new Set(selectedCreators);
    filteredSavedCreators.forEach(s => newSelected.add(s.creator_profile_id));
    setSelectedCreators(newSelected);
  };

  const deselectAll = () => {
    setSelectedCreators(new Set());
  };

  const handleCampaignInviteSuccess = () => {
    setSelectedCreators(new Set());
    setSelectionMode(false);
    setCampaignInviteDialogOpen(false);
  };

  const canSendCampaignInvites = subscriptionTier === 'pro' || subscriptionTier === 'premium';

  // Show upgrade prompt for Basic tier users
  if (hasCRMAccess === false) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold mb-2">Your Creators</h2>
          <p className="text-muted-foreground">Manage your saved creators and past collaborations</p>
        </div>
        <Button asChild variant="outline" className="gap-2 shrink-0">
          <Link to="/influencers">
            <Search className="h-4 w-4" />
            Browse All Creators
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
        <UpgradePrompt feature="crm" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold mb-2">Your Creators</h2>
          <p className="text-muted-foreground">Manage your saved creators and past collaborations</p>
        </div>
        <div className="flex gap-2">
          {canSendCampaignInvites && savedCreators.length > 0 && (
            <>
              {selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    disabled={selectedCreators.size === 0}
                  >
                    Deselect All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllVisible}
                  >
                    Select All ({filteredSavedCreators.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCampaignInviteDialogOpen(true)}
                    disabled={selectedCreators.size === 0}
                    className="gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Send Invite ({selectedCreators.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedCreators(new Set());
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectionMode(true)}
                  className="gap-2"
                >
                  <Megaphone className="h-4 w-4" />
                  Invite to Campaign
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedCreators.length}</p>
                <p className="text-sm text-muted-foreground">Saved Creators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workedWithCreators.length}</p>
                <p className="text-sm text-muted-foreground">Worked With</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/10">
                <StickyNote className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-sm text-muted-foreground">Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="saved" className="space-y-6">
        <TabsList>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" />
            Saved ({savedCreators.length})
          </TabsTrigger>
          <TabsTrigger value="worked" className="gap-2">
            <Users className="h-4 w-4" />
            Worked With ({workedWithCreators.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          {/* Folder Filter */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={selectedFolder === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder("all")}
              >
                All
              </Button>
              {folders.map(folder => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFolder(folder)}
                >
                  {folder}
                </Button>
              ))}
            </div>
          )}

          {filteredSavedCreators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? "No creators match your search"
                    : selectedFolder === "all" 
                      ? "No saved creators yet. Save creators from their profile pages!"
                      : `No creators in "${selectedFolder}" folder`}
                </p>
                {!searchQuery && (
                  <Button asChild variant="outline" className="mt-4 gap-2">
                    <Link to="/influencers">
                      <Search className="h-4 w-4" />
                      Browse Creators
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSavedCreators.map((saved) => {
                const creatorNotes = getCreatorNotes(saved.creator_profile_id);
                const contentCount = contentCountMap[saved.creator_profile_id] || 0;
                const isSelected = selectedCreators.has(saved.creator_profile_id);
                return (
                  <Card 
                    key={saved.id} 
                    className={`overflow-hidden transition-all ${
                      selectionMode 
                        ? isSelected 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-lg cursor-pointer' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={selectionMode ? () => toggleCreatorSelection(saved.creator_profile_id) : undefined}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {selectionMode && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleCreatorSelection(saved.creator_profile_id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                        )}
                        <Avatar className="h-12 w-12">
                          {saved.creator.profile_image_url ? (
                            <AvatarImage src={saved.creator.profile_image_url} />
                          ) : null}
                          <AvatarFallback className="bg-gradient-accent text-white">
                            {saved.creator.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{saved.creator.display_name}</CardTitle>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{saved.creator.location_country || "Location not set"}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {saved.creator.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {saved.folder_name}
                        </Badge>
                        {creatorNotes.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <StickyNote className="h-3 w-3" />
                            {creatorNotes.length}
                          </Badge>
                        )}
                        {contentCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Image className="h-3 w-3" />
                            {contentCount}
                          </Badge>
                        )}
                      </div>

                      {!selectionMode && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => window.location.href = `/creator/${saved.creator.id}`}
                          >
                            View Profile
                          </Button>
                          {contentCount > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/brand-dashboard?tab=content-library&creatorId=${saved.creator_profile_id}`}
                              className="gap-1"
                            >
                              <Image className="h-4 w-4" />
                              Content
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNotesDialog(saved.creator_profile_id, saved.creator.display_name)}
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCreatorToMove(saved.id);
                              setMoveDialogOpen(true);
                            }}
                          >
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleUnsaveCreator(saved.id)}
                          >
                            <HeartOff className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="worked" className="space-y-4">
          {filteredWorkedWithCreators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No creators match your search" : "No past collaborations yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkedWithCreators.map((creator) => {
                const creatorNotes = getCreatorNotes(creator.creator_profile_id);
                const contentCount = contentCountMap[creator.creator_profile_id] || 0;
                return (
                  <Card key={creator.creator_profile_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          {creator.profile_image_url ? (
                            <AvatarImage src={creator.profile_image_url} />
                          ) : null}
                          <AvatarFallback className="bg-gradient-accent text-white">
                            {creator.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{creator.display_name}</CardTitle>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{creator.location_country || "Location not set"}</span>
                          </div>
                        </div>
                        {creator.avg_rating && (
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="text-xs font-semibold">{creator.avg_rating}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {creator.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{creator.total_bookings} booking{creator.total_bookings > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${(creator.total_spent_cents / 100).toLocaleString()}</span>
                        </div>
                        {contentCount > 0 && (
                          <div className="flex items-center gap-2 col-span-2">
                            <Image className="h-4 w-4 text-muted-foreground" />
                            <span>{contentCount} content item{contentCount > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last: {formatDistanceToNow(new Date(creator.last_booking_date), { addSuffix: true })}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          className="flex-1 gradient-hero hover:opacity-90"
                          onClick={() => window.location.href = `/creator/${creator.creator_profile_id}`}
                        >
                          Rebook
                        </Button>
                        {contentCount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/brand-dashboard?tab=content-library&creatorId=${creator.creator_profile_id}`}
                            className="gap-1"
                          >
                            <Image className="h-4 w-4" />
                            Content
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openNotesDialog(creator.creator_profile_id, creator.display_name)}
                        >
                          <StickyNote className="h-4 w-4" />
                          {creatorNotes.length > 0 && (
                            <span className="ml-1 text-xs">({creatorNotes.length})</span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notes for {selectedCreatorForNotes?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add new note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a private note about this creator..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button 
                size="sm" 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            {/* Existing notes */}
            {selectedCreatorForNotes && getCreatorNotes(selectedCreatorForNotes.id).length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Previous Notes</h4>
                {getCreatorNotes(selectedCreatorForNotes.id).map((note) => (
                  <div key={note.id} className="bg-muted rounded-lg p-3 space-y-2">
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{note.note_content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.updated_at), "MMM d, yyyy")}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingNote(note.id);
                                setEditNoteContent(note.note_content);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select onValueChange={(value) => {
              if (selectedCreatorToMove) {
                handleMoveToFolder(selectedCreatorToMove, value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_OPTIONS.map(folder => (
                  <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Or create new folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button
                disabled={!newFolderName.trim()}
                onClick={() => {
                  if (selectedCreatorToMove && newFolderName.trim()) {
                    handleMoveToFolder(selectedCreatorToMove, newFolderName.trim());
                  }
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mass Campaign Invite Dialog */}
      {brandProfileId && (
        <MassCampaignInviteDialog
          open={campaignInviteDialogOpen}
          onOpenChange={setCampaignInviteDialogOpen}
          brandProfileId={brandProfileId}
          selectedCreatorIds={Array.from(selectedCreators)}
          onSuccess={handleCampaignInviteSuccess}
        />
      )}
    </div>
  );
};

export default BrandYourCreatorsTab;
