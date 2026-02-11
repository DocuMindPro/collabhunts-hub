

## Add Notifications Access for Creators + Auto-Notify on New Opportunities

### Problem
1. **No notification bell on native app**: The `Notifications` component only exists inside the `Navbar`, which is hidden on native (`!isNative && <Navbar />`). Creators on the mobile app have no way to see notifications.
2. **No notification when a brand posts a new opportunity**: Creators are not alerted when new opportunities are posted.

### Solution

#### Part 1: Add Notification Bell to Creator Dashboard Header

Add a notification bell icon with unread badge directly in the Creator Dashboard header area (next to "Dashboard" title). This works on both web and native since it's part of the page content, not the Navbar.

| File | Change |
|------|--------|
| `src/pages/CreatorDashboard.tsx` | Import and render the `Notifications` component next to the dashboard title. Show it on both native and web. On native, it becomes the primary way to access notifications. |

The header will change from:
```
Dashboard          [Approved]
```
To:
```
Dashboard          [Bell Icon] [Approved]
```

#### Part 2: Notify All Creators When a New Opportunity is Posted

Create a database trigger + edge function that fires whenever a new row is inserted into `brand_opportunities` with `status = 'open'`. It will insert a notification row for every approved creator.

| Component | Change |
|-----------|--------|
| Database trigger | Create a function `notify_creators_new_opportunity` that inserts a notification for each approved creator when a new opportunity is inserted |
| `brand_opportunities` table | Add an `AFTER INSERT` trigger that calls the notification function |

The trigger approach (using a PL/pgSQL function) keeps it simple and avoids needing an edge function or `pg_net`. It will:
1. Query all `creator_profiles` with `status = 'approved'`
2. Insert a notification for each creator's `user_id` with title "New Opportunity Available", the opportunity title in the message, and a link to `/opportunities`
3. Only trigger for opportunities with `status = 'open'`

### Technical Details

**Database migration SQL:**
```sql
CREATE OR REPLACE FUNCTION public.notify_creators_new_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'open' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      cp.user_id,
      'New Opportunity Available',
      'A new opportunity "' || COALESCE(NEW.title, 'Untitled') || '" has been posted. Check it out!',
      'opportunity',
      '/opportunities'
    FROM public.creator_profiles cp
    WHERE cp.status = 'approved';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_creators_new_opportunity
  AFTER INSERT ON public.brand_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creators_new_opportunity();
```

**CreatorDashboard.tsx changes:**
- Import `Notifications` from `@/components/Notifications`
- Render the bell icon in the header row on both native and web, giving creators easy access to all their notifications

