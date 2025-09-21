import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientCardProps {
  client: Client;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onView: (clientId: string) => void;
}

// Memoized component to prevent unnecessary re-renders
export const MemoizedClientCard = memo<ClientCardProps>(({
  client,
  onEdit,
  onDelete,
  onView,
}) => {
  // Memoize callbacks to prevent child re-renders
  const handleEdit = useCallback(() => {
    onEdit(client.id);
  }, [client.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(client.id);
  }, [client.id, onDelete]);

  const handleView = useCallback(() => {
    onView(client.id);
  }, [client.id, onView]);

  // Memoize computed values
  const fullName = React.useMemo(() => 
    `${client.firstName} ${client.lastName}`, 
    [client.firstName, client.lastName]
  );

  const statusColor = React.useMemo(() => {
    switch (client.status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }, [client.status]);

  const createdDate = React.useMemo(() => 
    new Date(client.createdAt).toLocaleDateString(),
    [client.createdAt]
  );

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {fullName}
          </CardTitle>
          <Badge className={statusColor}>
            {client.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {client.email}
          </p>
          {client.phone && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {client.phone}
            </p>
          )}
          <p className="text-sm text-gray-600">
            <span className="font-medium">Created:</span> {createdDate}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleView}
            className="flex-1"
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="flex-1"
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

MemoizedClientCard.displayName = 'MemoizedClientCard';

export default MemoizedClientCard;
