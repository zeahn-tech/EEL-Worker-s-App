-- Row Level Security policies for public.profiles
-- ---------------------------------------------------------------------------
-- Run this in your Supabase project's SQL Editor (Dashboard → SQL Editor → New
-- query → paste → Run). It's safe to re-run any time — old versions of these
-- policies are dropped first.
--
-- Without these policies, RLS blocks everything by default, which is exactly
-- what causes:
--   "Account created, but profile setup failed: permission denied for table profiles"
--   "No staff profile found for this account. Contact an administrator."
-- The first happens because a newly-signed-up user has no permission to INSERT
-- their own profile row. The second is the direct consequence — since the insert
-- failed, the row never got created, so login can't find it.
--
-- This version also fixes a separate, more fundamental gap: a fresh Supabase-backed
-- deployment has NO Admin account at all (self-signup always creates 'Worker' role,
-- by design), and normally only an existing Admin can promote someone — so nobody
-- could ever reach the Admin Dashboard. Policy #3 below now includes a one-time
-- bootstrap exception: any signed-in user can promote themselves to Admin only while
-- zero Admins exist anywhere in the table. The app surfaces this as a "Claim Admin
-- Access" button. The moment one Admin exists, that door closes for everyone else —
-- enforced here in the database, not just hidden in the UI.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can insert any profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;
drop policy if exists "Admins can delete any profile" on public.profiles;

-- 1. Any signed-in user can read the full staff directory
--    (needed for the chat member list / Staff Manager)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- 2. A user can create their OWN profile row (id must match their own auth uid).
--    This is what makes self-service Sign Up work.
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- 3. A user can update their OWN row (name, avatar, etc. via Account Settings).
--    Note the WITH CHECK: it blocks a user from changing their own `role` — without
--    this, "update their own row" would let anyone hand themselves Admin via a raw
--    API call, since RLS has no built-in concept of "these columns only". The one
--    exception is the bootstrap case below: if literally no Admin exists yet anywhere
--    in the system, promoting yourself to Admin is allowed — that's how a brand-new
--    deployment gets its first Admin at all (self-signup deliberately never creates
--    one, and normally only an existing Admin can promote someone).
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (
      role = (select p.role from public.profiles p where p.id = auth.uid())
      or (role = 'Admin' and not exists (select 1 from public.profiles p where p.role = 'Admin'))
    )
  );

-- 4. Admins can create a profile row for someone else
--    (Staff Manager → Add Worker).
create policy "Admins can insert any profile"
  on public.profiles for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'Admin')
  );

-- 5. Admins can update ANY row (Staff Manager: suspend / ban / role changes).
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'Admin')
  );

-- 6. Admins can delete ANY row (Staff Manager: remove worker).
create policy "Admins can delete any profile"
  on public.profiles for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'Admin')
  );

-- ---------------------------------------------------------------------------
-- Optional (recommended): auto-create a profile row the instant an auth user
-- is created, server-side, via a trigger — instead of relying on the app's
-- client-side insert-on-signup.
--
-- Why bother if the app already inserts the row itself? Because that client
-- insert can only run once the new user has an active session, and if your
-- project has "Confirm email" turned on (Authentication → Providers → Email),
-- signUp() returns NO session until they click the link in their inbox — so
-- the client-side insert is skipped, and the row only appears once they log
-- in for the first time afterward (the app self-heals this automatically).
-- This trigger closes that gap entirely: the profiles row exists immediately,
-- before the person even leaves the sign-up form, regardless of your email
-- confirmation setting. It's a straight upsert (ON CONFLICT DO NOTHING), so
-- it's harmless to run even though the app also does its own insert — one of
-- the two just ends up being a no-op.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, department, status, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Worker',
    '',
    'Active',
    ''
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Optional: Storage bucket for profile photo uploads (Account Settings →
-- upload photo). Skip this section if you don't need avatar uploads yet.
-- Create the bucket first via Dashboard → Storage → New bucket → name it
-- "avatars" and mark it Public, THEN run the policies below.
-- ---------------------------------------------------------------------------

drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
