'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Role {
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  commitmentExpected: string;
  isActive: boolean;
}

interface ApplicationFormProps {
  projectId: string;
  roles: Role[];
}

export default function ApplicationForm({ projectId, roles }: ApplicationFormProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role to apply for.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleAppliedFor: selectedRole,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the project owner.",
      });

      router.refresh();
    } catch (error) {
      console.error('Application submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role to apply for" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role, index) => (
              <SelectItem key={index} value={role.title}>
                {role.title} ({role.experienceLevel})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          placeholder="Tell the project owner why you'd be a great fit for this role..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !selectedRole}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}
