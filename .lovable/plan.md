

## Fix: Admin Cannot Assign Subscription Plans

### Problem
The `brand_subscriptions` table has no INSERT policy for admins. The only INSERT policy is "Brands can insert their own subscription," which checks that the inserting user owns the brand profile. When an admin tries to create a subscription for a different brand, it gets blocked by RLS.

### Solution
Add an RLS policy that allows admins to insert subscriptions for any brand. This will use the existing `is_admin` helper function (or equivalent) already used by the admin update/delete policies.

### Database Migration

```sql
CREATE POLICY "Admins can insert subscriptions"
  ON public.brand_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

(The exact admin check will match whatever pattern the existing admin update/delete policies use.)

### Files Changed
- Database migration only -- no code changes needed
