import { Session, SupabaseClient } from '@supabase/supabase-js';
import SupabaseService  from './supabase';
class AuthService {
    static instance:AuthService|null = null;
    supabase! : SupabaseClient;
    constructor(){
        if(!AuthService.instance){
            this.supabase = SupabaseService.getClient();
            AuthService.instance = this;
        }
    }
    static getInstance():AuthService{
        if(!AuthService.instance){
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    async login(email:string,password:string){
        return await this.supabase.auth.signInWithPassword({email,password})
    }
    async logout(){
        await this.supabase.auth.signOut();
        window.location.reload();
    }
    async getSession():Promise<Session|null>{
        const {data,error} = await this.supabase.auth.getSession();
        if(error){
            console.log(error);
            return null;
        }
        return data?.session ?? null;
    }
    
}

export default AuthService;