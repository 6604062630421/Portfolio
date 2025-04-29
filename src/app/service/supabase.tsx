import { createClient, SupabaseClient } from '@supabase/supabase-js'
class SupabaseService{
    private static instance:SupabaseService;
    private supabase:SupabaseClient;
    private constructor(){
        this.supabase=createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }
    static getInstance():SupabaseService{
        if(!SupabaseService.instance){
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }
    getClient(){
        return this.supabase;
    }
}
export default SupabaseService.getInstance();
    