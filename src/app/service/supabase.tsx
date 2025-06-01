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
    async uploadToStorage(bucket:string,blob:Blob){
        const supabase = this.supabase;
        const extension = blob.type.split('/')[1]||'bin';
        const fileName = `${Date.now()}.${extension}`;
        const {data,error} = await supabase.storage.from(bucket).upload(fileName,blob,{
            cacheControl:'3600',
            upsert:true,
            contentType:blob.type,
        })
        if(error){
            console.log(error.message);
            return null
        }
        const{data:publicUrlData} = supabase.storage.from(bucket).getPublicUrl(fileName);
        return{uploadData:data,
            publicUrl:fileName
        }
    }
}
export default SupabaseService.getInstance();
    