
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlmyycjetgqyvhvxksbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbXl5Y2pldGdxeXZodnhrc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4ODUzMzksImV4cCI6MjA1MTQ2MTMzOX0.683CxrKK2-7H6iX2hK-K59kKPWiQuRSWwtqv1d4N-iE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
