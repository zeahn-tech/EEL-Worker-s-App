// Real backend auth + staff-directory access against Supabase, used when a project
// URL + anon key are configured in Admin Settings. Chat messages/groups intentionally
// stay on local storage (see context/ChatContext.jsx) — only accounts/login are backed
// by Supabase per the current setup.
//
// Expects the `public.profiles` table described in supabaseClient.js's schema comment,
// with `id` matching the corresponding auth.users id (auth.uid()).
//
// Required for this to work against your project:
//  - Row Level Security policies on `profiles` that allow:
//      - any authenticated user to SELECT all rows (needed for the staff directory /
//        chat member list)
//      - a user to UPDATE their own row (password changes touch auth, not this table)
//      - Admin-role users to UPDATE/DELETE any row (staff management)
//  - A trigger (or this code's upsert-on-signup) that creates a `profiles` row when a
//    new auth user is created, defaulting role to 'Worker'.

import { getSupabaseClient, getAdminActionClient } from './supabaseClient';

const toAppUser = (profile) => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role || 'Worker',
  department: profile.department || '',
  status: profile.status || 'Active',
  avatar: profile.avatar || '',
  initials: (profile.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
  phone: profile.phone || '',
  online: true,
  lastSeen: 'Just now'
});

export const fetchProfile = async (userId) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return toAppUser(data);
};

export const fetchAllProfiles = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('profiles').select('*').order('name');
  if (error || !data) return [];
  return data.map(toAppUser);
};

export const signInWithPassword = async (email, password) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: mapAuthError(error) };

  const profile = await fetchProfile(data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    return { success: false, error: 'No staff profile found for this account. Contact an administrator.' };
  }
  if (profile.status === 'Banned') {
    await supabase.auth.signOut();
    return { success: false, error: 'This account has been banned. Contact an administrator.' };
  }
  return { success: true, user: profile };
};

export const signOut = async () => {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
};

export const getRestoredSession = async () => {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) return null;

  const profile = await fetchProfile(session.user.id);
  if (!profile || profile.status === 'Banned') {
    await supabase.auth.signOut();
    return null;
  }
  return profile;
};

export const changeOwnPasswordSupabase = async (currentPassword, newPassword, email) => {
  const supabase = getSupabaseClient();
  // Re-verify the current password before allowing a change, same as the local-auth flow.
  const reauth = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (reauth.error) return { success: false, error: 'Current password is incorrect.' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: mapAuthError(error) };
  return { success: true };
};

// Admin action: send a password-reset email via Supabase. There is no way for a
// client using only the anon key to set or reveal another user's password directly —
// Supabase's own security model requires the account holder to complete the reset via
// the emailed link. This requires email sending to be configured in your Supabase
// project (Authentication → Email Templates / SMTP settings).
export const sendPasswordResetEmail = async (email) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, error: mapAuthError(error) };
  return { success: true };
};

// Admin action: create a brand-new worker account. Uses an isolated, session-less
// Supabase client so this signUp() call can never overwrite the admin's own session.
export const createWorkerAccount = async ({ name, email, password, role, department, phone }) => {
  const actionClient = getAdminActionClient();
  const { data, error } = await actionClient.auth.signUp({ email, password });
  if (error) return { success: false, error: mapAuthError(error) };
  if (!data.user) {
    return { success: false, error: 'Could not create account — check if email confirmation is required in your Supabase project settings.' };
  }

  // Create/complete the profile row for this new user (in case no DB trigger exists yet).
  const supabase = getSupabaseClient();
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    name,
    email,
    role: role || 'Worker',
    department: department || '',
    status: 'Active',
    phone: phone || ''
  });
  if (profileError) {
    return { success: false, error: `Account created, but profile setup failed: ${profileError.message}` };
  }

  return { success: true, user: toAppUser({ id: data.user.id, name, email, role, department, phone, status: 'Active' }) };
};

export const updateProfileStatus = async (userId, status) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
  return { success: !error, error: error?.message };
};

export const deleteProfile = async (userId) => {
  const supabase = getSupabaseClient();
  // This removes the staff directory / profile row. Fully deleting the underlying
  // auth.users account requires the service role key (server-side only) — do that from
  // your Supabase dashboard if you want the login itself gone, not just the profile.
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  return { success: !error, error: error?.message };
};

export const subscribeToProfileChanges = (onChange) => {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel('profiles-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
      fetchAllProfiles().then(onChange);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
};

const mapAuthError = (error) => {
  const msg = error?.message || 'Something went wrong.';
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.';
  return msg;
};
