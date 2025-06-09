"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole, PERMISSIONS, hasPermission } from "@/lib/permissions";
import { Shield, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RolePermissions {
  [key: string]: {
    [key: string]: boolean;
  };
}

export default function RoleManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    } else {
      fetchRolePermissions();
    }
  }, [session, status, router]);

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) throw new Error('Failed to fetch role permissions');
      const data = await response.json();
      setRolePermissions(data);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load role permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (role: string, permission: string, checked: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: checked
      }
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolePermissions),
      });

      if (!response.ok) throw new Error('Failed to update role permissions');

      toast({
        title: "Success",
        description: "Role permissions updated successfully",
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update role permissions",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(UserRole).map((role) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </CardTitle>
              <CardDescription>
                Manage permissions for {role.toLowerCase()} role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(PERMISSIONS).map(([permission, description]) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${role}-${permission}`}
                      checked={rolePermissions[role]?.[permission] || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(role, permission, checked as boolean)
                      }
                      disabled={role === UserRole.ADMIN && permission === 'manage:roles'}
                    />
                    <label
                      htmlFor={`${role}-${permission}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {description}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 