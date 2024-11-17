import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Profile, Exercise, Progress } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await wait(delay);
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const supabaseApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    return retryOperation(async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          return this.createDefaultProfile(userId);
        }
        throw error;
      }

      return data;
    });
  },

  async createDefaultProfile(userId: string): Promise<Profile> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No authenticated user');

    const defaultProfile = {
      user_id: userId,
      email: userData.user.email!,
      username: userData.user.email!.split('@')[0],
      full_name: '',
      role: 'user',
      streak: 0,
      exercises_done: 0,
      practice_time: 0
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(profile: Partial<Profile> & { user_id: string }): Promise<Profile> {
    return retryOperation(async () => {
      if (!profile.user_id) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  async uploadProgressImage(userId: string, file: File): Promise<string> {
    if (!userId) throw new Error('User ID is required');
    if (!file) throw new Error('File is required');

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
    }

    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('progress')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('progress')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!userId) throw new Error('User ID is required');
    if (!file) throw new Error('File is required');

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
    }

    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async uploadFile(file: File, bucket: string): Promise<string> {
    if (!file) throw new Error('File is required');

    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async createProgressEntry(userId: string, imageUrl: string, notes: string): Promise<Progress> {
    if (!userId) throw new Error('User ID is required');
    if (!imageUrl) throw new Error('Image URL is required');

    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        notes: notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProgress(userId: string): Promise<Progress[]> {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteProgress(userId: string, progressId: string): Promise<void> {
    if (!userId) throw new Error('User ID is required');
    if (!progressId) throw new Error('Progress ID is required');

    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('id', progressId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};