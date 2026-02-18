import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { useBrandStats } from "@/hooks/useBrandDashboard";
import MessagingQuotaCard from "./MessagingQuotaCard";

interface BrandOverviewTabProps {
  registrationCompleted?: boolean;
}

const BrandOverviewTab = ({ registrationCompleted = true }: BrandOverviewTabProps) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { data, isLoading: loading } = useBrandStats();

  const stats = {
    totalSpent: data?.totalSpent ?? 0,
    activeEvents: data?.activeEvents ?? 0,
    completedEvents: data?.completedEvents ?? 0,
    pendingRequests: data?.pendingRequests ?? 0,
  };
  const recentActivity = data?.recentActivity ?? [];

  const handleTabNavigation = (tab: string) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row - Unified Card */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">${stats.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.activeEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.completedEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.pendingRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Quota */}
      <MessagingQuotaCard />

      {/* Recent Activity */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => handleTabNavigation('bookings')}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                  onClick={() => handleTabNavigation('bookings')}
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="flex-1 truncate">{activity.description}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.timeAgo}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => navigate('/influencers')}
              >
                Find creators to get started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => registrationCompleted ? navigate('/influencers') : navigate('/brand-onboarding')}
              className="h-auto py-3 flex-col gap-1.5 text-xs"
              disabled={!registrationCompleted}
            >
              <Users className="h-4 w-4" />
              <span>Find Creators</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabNavigation('opportunities')}
              className="h-auto py-3 flex-col gap-1.5 text-xs"
              disabled={!registrationCompleted}
            >
              <Briefcase className="h-4 w-4" />
              <span>Opportunities</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabNavigation('messages')}
              className="h-auto py-3 flex-col gap-1.5 text-xs"
              disabled={!registrationCompleted}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOverviewTab;
