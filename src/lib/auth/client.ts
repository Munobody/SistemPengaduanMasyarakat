import { useRouter } from 'next/navigation';
import axios from 'axios';
import { User } from '@/types/user';
import { paths } from '@/paths';
import { toast } from 'react-toastify';
import api from '../api/api';

export interface SignInWithPasswordParams {
  no_identitas: string;
  password: string;
}

class AuthClient {
  async signUp(_: any): Promise<{ error?: string }> {
    return { error: 'Sign up is not available' };
  }

  async signInWithOAuth(_: any): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(
    params: SignInWithPasswordParams
  ): Promise<{ error?: string; user?: User; message?: string }> {
    const { no_identitas, password } = params;

    try {
      const loginResponse = await api.post(`/login`, {
        no_identitas,
        password,
      });

      console.log('Respons login:', loginResponse.data);
      const { content, message } = loginResponse.data;

      let token = content?.token;
      let user = content?.user;

      if (!token) {
        console.log('Token tidak ditemukan, mencoba mendapatkan dari /verify-token...');
        
        const verifyResponse = await api.get(`/verify-token`, {
          withCredentials: true, 
        });

        if (verifyResponse.data?.token) {
          token = verifyResponse.data.token;
          user = verifyResponse.data.user;
        }
      }

      if (token) {
        localStorage.setItem('custom-auth-token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, message };
      } else {
        console.error('Login gagal: Token tidak diterima');
        return { error: 'Login gagal. Token tidak diterima.' };
      }

    } catch (error) {
      console.error('Error login:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detail error Axios:', error.response?.data);
        return { error: error.response?.data.message || 'Terjadi kesalahan saat login' };
      } else {
        return { error: 'Terjadi kesalahan yang tidak terduga.' };
      }
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    if (typeof window === 'undefined') {
      return { data: null };
    }

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }
    
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp < currentTime) {
        console.warn('Token kadaluarsa, menjalankan proses logout otomatis');
        // Hapus data autentikasi
        localStorage.removeItem('custom-auth-token');
        localStorage.removeItem('user');
      
        toast.error('Sesi anda telah berakhir. Silakan login kembali.');
        
        setTimeout(() => {
          window.location.href = paths.auth.signIn;
        }, 1000);

        return { 
          data: null, 
          error: 'Token telah kadaluarsa. Silakan login kembali.' 
        };
      }
    
      const user = localStorage.getItem('user');
      return { data: user ? JSON.parse(user) : null };
    } catch (error) {
      console.error('Error saat memverifikasi token:', error);

      localStorage.removeItem('custom-auth-token');
      localStorage.removeItem('user');

      window.location.href = paths.auth.signIn;

      return {
        data: null,
        error: 'Terjadi kesalahan saat memverifikasi token. Silakan login kembali.' 
      };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
    window.location.href = paths.auth.signIn;
    return {};
  }

  async getAclByUserLevelId(userLevelId: string): Promise<any> {
    try {
      const response = await api.get(`/acl/${userLevelId}`);
      console.log('ACL Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching ACL:', error);
      if (axios.isAxiosError(error)) {
        return { error: error.response?.data.message || 'Gagal mengambil data ACL' };
      }
      return { error: 'Terjadi kesalahan yang tidak terduga.' };
    }
  }
}

export const authClient = new AuthClient();