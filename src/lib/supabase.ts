import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with retry logic
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'nesttask@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add retry configuration
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-store'
      }
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    }).catch((error) => {
      console.error('Supabase fetch error:', error);
      throw error;
    });
  }
});

// Initialize connection state
let isInitialized = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to test connection with retry logic
export async function testConnection(): Promise<boolean> {
  if (isInitialized) return true;
  
  try {
    const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    isInitialized = true;
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error: any) {
    console.error('Supabase connection error:', error.message);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (attempt ${retryCount}/${MAX_RETRIES})...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
      return testConnection();
    }
    
    return false;
  }
}

// Test connection immediately
testConnection().catch(console.error);