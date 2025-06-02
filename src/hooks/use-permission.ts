import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/api';

interface Permission {
  subject: string;
  actions: string[];
}

export function usePermission() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setLoading(false);
        return;
      }

      const { userLevelId } = JSON.parse(userData);
      const response = await api.get(`/acl/${userLevelId}`);
      
      if (response.data?.content?.permissions) {
        setPermissions(response.data.content.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((subject: string, action: string) => {
    const modulePermissions = permissions.find(p => p.subject === subject);
    return modulePermissions?.actions.includes(action) || false;
  }, [permissions]);

  return {
    loading,
    hasPermission,
    permissions,
  };
}