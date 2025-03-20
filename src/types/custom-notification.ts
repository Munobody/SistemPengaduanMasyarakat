// src/types.ts
export interface NotificationResponse {
    content: {
      entries: Notification[];
      notRead: number; // Jumlah notifikasi yang belum dibaca
      totalData: number;
      totalPage: number;
    };
    message: string;
    errors: string[];
  }
  
  export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    type: string;
    pengaduanId: string;
    pengaduanMasyarakatId: string | null;
    pelaporanWBSId: string | null;
  }