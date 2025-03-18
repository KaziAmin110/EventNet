import supabase from './supabaseClient.js';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Error signing up:', error);
    return { error };
  }
  console.log('Sign up successful:', data);
  return { data };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Error signing in:', error);
    return { error };
  }
  console.log('Sign in successful:', data);
  return { data };
}
