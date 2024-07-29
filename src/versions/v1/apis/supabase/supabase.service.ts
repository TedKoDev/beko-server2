import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as config from 'config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      config.get('supabase.url'),
      config.get('supabase.key'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
