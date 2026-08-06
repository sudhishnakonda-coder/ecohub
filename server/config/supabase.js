import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://pmvkcuajzsbbfigfmhja.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdmtjdWFqenNiYmZpZ2ZtaGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzYxMjEsImV4cCI6MjEwMTU1MjEyMX0.vgUer6WP2p14MHZyhGbOzxtnXHpsbo3RET134uyDchY';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('⚡ Connected to Supabase Cloud Database:', supabaseUrl);
