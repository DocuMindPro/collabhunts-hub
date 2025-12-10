import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, MessageSquare, Megaphone, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type NotificationCategory = 'all' | 'booking' | 'message' | 'campaign' | 'profile';

const categoryConfig = {
  all: { icon: Bell, label: 'All' },
  booking: { icon: Package, label: 'Bookings' },
  message: { icon: MessageSquare, label: 'Messages' },
  campaign: { icon: Megaphone, label: 'Campaigns' },
  profile: { icon: User, label: 'Profile' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setOpen(false);
  };

  const toggleExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryFromType = (type: string): NotificationCategory => {
    if (type.includes('booking') || type.includes('delivery') || type.includes('payment')) return 'booking';
    if (type.includes('message')) return 'message';
    if (type.includes('campaign') || type.includes('application')) return 'campaign';
    if (type.includes('profile') || type.includes('approval')) return 'profile';
    return 'all';
  };

  const filteredNotifications = activeCategory === 'all' 
    ? notifications 
    : notifications.filter(n => getCategoryFromType(n.type) === activeCategory);

  const getCategoryUnreadCount = (category: NotificationCategory) => {
    if (category === 'all') return unreadCount;
    return notifications.filter(n => !n.read && getCategoryFromType(n.type) === category).length;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-bold text-lg">Notifications</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/30">
          {(Object.keys(categoryConfig) as NotificationCategory[]).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const count = getCategoryUnreadCount(category);
            const isActive = activeCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {category !== 'all' && count > 0 && (
                  <span className={cn(
                    "min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px]",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
                  )}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-border">
            <button 
              onClick={markAllAsRead}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        <DropdownMenuSeparator className="m-0" />
        
        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const isExpanded = expandedIds.has(notification.id);
                const shouldTruncate = notification.message.length > 80;
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                      !notification.read && "bg-muted/30"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                        )}
                        <p className={cn(
                          "text-sm truncate",
                          !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        )}>
                          {notification.title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: false })}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <div className={cn("pl-4", !notification.read && "pl-4")}>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        !isExpanded && shouldTruncate && "line-clamp-2"
                      )}>
                        {notification.message}
                      </p>
                      
                      {shouldTruncate && (
                        <button
                          onClick={(e) => toggleExpanded(notification.id, e)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1 font-medium"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              See less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              See more
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
