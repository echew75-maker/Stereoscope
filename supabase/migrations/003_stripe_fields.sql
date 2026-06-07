-- Add stripe_subscription_id to profiles (stripe_customer_id already exists)
alter table public.profiles
  add column if not exists stripe_subscription_id text;
