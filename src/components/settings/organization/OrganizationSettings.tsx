import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrganizationQuery } from "./hooks/useOrganizationQuery";
import { Badge } from "@/components/ui/badge";
export function OrganizationSettings() {
  const {
    data: organization,
    isLoading,
    error
  } = useOrganizationQuery();
  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>;
  }
  if (error) {
    return <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            There was an error loading the organization information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6">      
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic details about your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input id="org-name" value={organization?.name || ""} readOnly className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-id">Organization ID</Label>
            <Input id="org-id" value={organization?.id || ""} readOnly className="bg-muted font-mono text-xs" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="created-at">Created At</Label>
            <Input id="created-at" value={organization?.created_at ? new Date(organization.created_at).toLocaleString() : ""} readOnly className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>
            Information about your organization's activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Users</h4>
              <p className="text-2xl font-bold">{organization?.user_count || 0}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Properties</h4>
              <p className="text-2xl font-bold">{organization?.property_count || 0}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Active Tenants</h4>
              <p className="text-2xl font-bold">{organization?.tenant_count || 0}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">User Roles Distribution</h4>
            {organization?.user_roles && organization.user_roles.length > 0 ? <div className="flex flex-wrap gap-2">
                {organization.user_roles.map((role, index) => <Badge key={index} variant="outline" className="py-2 px-3">
                    <span className="font-semibold">{role.role}</span>
                    <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs">
                      {role.count}
                    </span>
                  </Badge>)}
              </div> : <p className="text-sm text-muted-foreground">No user role data available</p>}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Recent User Activity</h4>
            {organization?.recent_logins && organization.recent_logins.length > 0 ? <ul className="space-y-3">
                {organization.recent_logins.map((login, index) => <li key={index} className="bg-background p-3 border rounded-md text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {login.first_name && login.last_name ? `${login.first_name} ${login.last_name}` : login.user_email}
                        </span>
                        {login.first_name && login.last_name && <span className="text-muted-foreground ml-2">
                            ({login.user_email})
                          </span>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {login.timestamp ? new Date(login.timestamp).toLocaleString() : "Unknown time"}
                      </span>
                    </div>
                  </li>)}
              </ul> : <p className="text-sm text-muted-foreground">No recent login data available</p>}
          </div>
        </CardContent>
      </Card>
    </div>;
}