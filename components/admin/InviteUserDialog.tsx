import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectItem, SelectValue } from '../ui/Select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/Form';
import { UserRole } from '../../types';

const inviteUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Enter a valid email address.'),
  role: z.nativeEnum(UserRole),
});

type InviteUserSchema = z.infer<typeof inviteUserSchema>;

const roleOptions: { label: string; value: UserRole; description: string }[] = [
  { label: 'Administrator', value: UserRole.ADMIN, description: 'Full access to settings and data.' },
  { label: 'Staff', value: UserRole.STAFF, description: 'Manage operations without system settings.' },
  { label: 'Viewer', value: UserRole.VIEWER, description: 'Read-only access to dashboards.' },
];

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InviteUserSchema) => void;
  isSubmitting?: boolean;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({ open, onOpenChange, onSubmit, isSubmitting }) => {
  const form = useForm<InviteUserSchema>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: '', email: '', role: UserRole.STAFF },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ name: '', email: '', role: UserRole.STAFF });
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit(values => {
    onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite new team member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={event => field.onChange(event.target.value as UserRole)}>
                      <SelectValue placeholder="Select role" />
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {roleOptions.find(option => option.value === field.value)?.description}
                  </p>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending invite…' : 'Send invite'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export type { InviteUserSchema };
