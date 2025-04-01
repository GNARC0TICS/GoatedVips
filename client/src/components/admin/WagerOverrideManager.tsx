import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// Form schema for wager override
const wagerOverrideSchema = z.object({
  username: z.string().min(1, "Username is required"),
  goated_id: z.string().optional(),
  today_override: z.number().nullable().optional(),
  this_week_override: z.number().nullable().optional(),
  this_month_override: z.number().nullable().optional(),
  all_time_override: z.number().nullable().optional(),
  active: z.boolean().default(true),
  expires_at: z.string().optional(),
  notes: z.string().optional()
});

type WagerOverrideFormValues = z.infer<typeof wagerOverrideSchema>;

// API functions for interacting with the backend
const fetchOverrides = async () => {
  const response = await fetch('/api/admin/wager-overrides');
  if (!response.ok) {
    throw new Error('Failed to fetch wager overrides');
  }
  return response.json();
};

const createOverride = async (data: WagerOverrideFormValues) => {
  const response = await fetch('/api/admin/wager-overrides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create wager override');
  }
  
  return response.json();
};

const updateOverride = async ({ id, data }: { id: number, data: WagerOverrideFormValues }) => {
  const response = await fetch(`/api/admin/wager-overrides/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update wager override');
  }
  
  return response.json();
};

const deactivateOverride = async (id: number) => {
  const response = await fetch(`/api/admin/wager-overrides/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to deactivate wager override');
  }
  
  return response.json();
};

export default function WagerOverrideManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: overridesData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/wager-overrides'],
    queryFn: fetchOverrides,
  });
  
  const createMutation = useMutation({
    mutationFn: createOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wager-overrides'] });
      toast({
        title: 'Success',
        description: 'Wager override created successfully',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create wager override',
        variant: 'destructive',
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wager-overrides'] });
      toast({
        title: 'Success',
        description: 'Wager override updated successfully',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wager override',
        variant: 'destructive',
      });
    },
  });
  
  const deactivateMutation = useMutation({
    mutationFn: deactivateOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wager-overrides'] });
      toast({
        title: 'Success',
        description: 'Wager override deactivated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate wager override',
        variant: 'destructive',
      });
    },
  });
  
  // Form for creating new overrides
  const createForm = useForm<WagerOverrideFormValues>({
    resolver: zodResolver(wagerOverrideSchema),
    defaultValues: {
      username: '',
      goated_id: '',
      today_override: null,
      this_week_override: null,
      this_month_override: null,
      all_time_override: null,
      active: true,
      expires_at: '',
      notes: ''
    },
  });
  
  // Form for editing existing overrides
  const editForm = useForm<WagerOverrideFormValues>({
    resolver: zodResolver(wagerOverrideSchema),
    defaultValues: {
      username: '',
      goated_id: '',
      today_override: null,
      this_week_override: null,
      this_month_override: null,
      all_time_override: null,
      active: true,
      expires_at: '',
      notes: ''
    },
  });
  
  // Reset create form when dialog opens/closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      createForm.reset();
    }
  }, [isCreateDialogOpen, createForm]);
  
  // Populate edit form when an override is selected
  useEffect(() => {
    if (selectedOverride) {
      // Format expires_at for the date input if it exists
      let formattedExpiresAt = '';
      if (selectedOverride.expires_at) {
        const date = new Date(selectedOverride.expires_at);
        formattedExpiresAt = format(date, 'yyyy-MM-dd\'T\'HH:mm');
      }
      
      editForm.reset({
        username: selectedOverride.username,
        goated_id: selectedOverride.goated_id || '',
        today_override: selectedOverride.today_override ? Number(selectedOverride.today_override) : null,
        this_week_override: selectedOverride.this_week_override ? Number(selectedOverride.this_week_override) : null,
        this_month_override: selectedOverride.this_month_override ? Number(selectedOverride.this_month_override) : null,
        all_time_override: selectedOverride.all_time_override ? Number(selectedOverride.all_time_override) : null,
        active: selectedOverride.active,
        expires_at: formattedExpiresAt,
        notes: selectedOverride.notes || ''
      });
    }
  }, [selectedOverride, editForm]);
  
  const handleCreateSubmit = (values: WagerOverrideFormValues) => {
    createMutation.mutate(values);
  };
  
  const handleEditSubmit = (values: WagerOverrideFormValues) => {
    if (selectedOverride) {
      updateMutation.mutate({
        id: selectedOverride.id,
        data: values
      });
    }
  };
  
  const handleDeactivate = (id: number) => {
    if (confirm('Are you sure you want to deactivate this wager override?')) {
      deactivateMutation.mutate(id);
    }
  };
  
  // Helper function to format wager values
  const formatWager = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not set';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  if (isLoading) return <p>Loading wager overrides...</p>;
  if (error) return <p>Error loading wager overrides: {(error as Error).message}</p>;
  
  const overrides = overridesData?.data || [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wager Overrides</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Override</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Wager Override</DialogTitle>
              <DialogDescription>
                Create a manual override for a user's wager amounts. This will take precedence over values from the API.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormDescription>
                        The username of the user to override (must match exactly)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="goated_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goated ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Goated ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        The Goated ID of the user, if known
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="today_override"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Today's Wager</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty to not override" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="this_week_override"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>This Week's Wager</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty to not override" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="this_month_override"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>This Month's Wager</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty to not override" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="all_time_override"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>All-Time Wager</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty to not override" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === null ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When this override should expire
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for override" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Whether this override should be applied immediately
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Override'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {overrides.length === 0 ? (
        <p>No wager overrides found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Goated ID</TableHead>
              <TableHead>Today</TableHead>
              <TableHead>This Week</TableHead>
              <TableHead>This Month</TableHead>
              <TableHead>All-Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map((override: any) => (
              <TableRow key={override.id}>
                <TableCell className="font-medium">{override.username}</TableCell>
                <TableCell>{override.goated_id || '-'}</TableCell>
                <TableCell>{formatWager(override.today_override)}</TableCell>
                <TableCell>{formatWager(override.this_week_override)}</TableCell>
                <TableCell>{formatWager(override.this_month_override)}</TableCell>
                <TableCell>{formatWager(override.all_time_override)}</TableCell>
                <TableCell>
                  <span className={override.active ? 'text-green-500' : 'text-red-500'}>
                    {override.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  {override.expires_at ? format(new Date(override.expires_at), 'MMM d, yyyy h:mm a') : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedOverride(override);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    {override.active && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeactivate(override.id)}
                        disabled={deactivateMutation.isPending}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Wager Override</DialogTitle>
            <DialogDescription>
              Update the wager override for this user.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="goated_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goated ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Goated ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="today_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Today's Wager</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty to not override" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="this_week_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>This Week's Wager</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty to not override" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="this_month_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>This Month's Wager</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty to not override" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="all_time_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>All-Time Wager</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty to not override" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this override should expire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Reason for override" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Whether this override should be applied
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Override'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}