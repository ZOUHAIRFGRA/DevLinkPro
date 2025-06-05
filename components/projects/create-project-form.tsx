'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Web Development',
  'Mobile Development', 
  'Data Science',
  'Machine Learning',
  'Game Development',
  'Desktop Application',
  'API/Backend',
  'Other'
];

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

interface Role {
  title: string;
  description: string;
  skills: string[];
  experienceLevel: string;
  commitmentExpected: string;
  isActive: boolean;
}

interface CreateProjectFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    currentStatus?: string;
    category?: string;
    difficulty?: string;
    estimatedDuration?: string;
    isPublic?: boolean;
    goals?: string[];
    technologies?: string[];
    plannedTechnologies?: string[];
    rolesNeeded?: Role[];
  };
  isEditing?: boolean;
}

export default function CreateProjectForm({ initialData, isEditing = false }: CreateProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    currentStatus: initialData?.currentStatus || '',
    category: initialData?.category || '',
    difficulty: initialData?.difficulty || '',
    estimatedDuration: initialData?.estimatedDuration || '',
    isPublic: initialData?.isPublic ?? true
  });

  const [goals, setGoals] = useState<string[]>(
    initialData?.goals && initialData.goals.length > 0 ? initialData.goals : ['']
  );
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies && initialData.technologies.length > 0 ? initialData.technologies : ['']
  );
  const [plannedTechnologies, setPlannedTechnologies] = useState<string[]>(
    initialData?.plannedTechnologies && initialData.plannedTechnologies.length > 0 ? initialData.plannedTechnologies : ['']
  );
  const [rolesNeeded, setRolesNeeded] = useState<Role[]>(
    initialData?.rolesNeeded && initialData.rolesNeeded.length > 0 ? initialData.rolesNeeded : [{
      title: '',
      description: '',
      skills: [''],
      experienceLevel: '',
      commitmentExpected: '',
      isActive: true
    }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty values
      const filteredGoals = goals.filter(goal => goal.trim() !== '');
      const filteredTechnologies = technologies.filter(tech => tech.trim() !== '');
      const filteredPlannedTechnologies = plannedTechnologies.filter(tech => tech.trim() !== '');
      const filteredRoles = rolesNeeded.map(role => ({
        ...role,
        skills: role.skills.filter(skill => skill.trim() !== '')
      })).filter(role => role.title.trim() !== '' && role.description.trim() !== '');

      const projectData = {
        ...formData,
        goals: filteredGoals,
        technologies: filteredTechnologies,
        plannedTechnologies: filteredPlannedTechnologies,
        rolesNeeded: filteredRoles
      };

      const url = isEditing ? `/api/projects/${initialData?._id}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: isEditing ? 'Project updated successfully!' : 'Project created successfully!'
        });
        router.push(`/projects/${result.data._id}`);
      } else {
        throw new Error(result.error || (isEditing ? 'Failed to update project' : 'Failed to create project'));
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : (isEditing ? 'Failed to update project' : 'Failed to create project'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => setGoals([...goals, '']);
  const removeGoal = (index: number) => setGoals(goals.filter((_, i) => i !== index));
  const updateGoal = (index: number, value: string) => {
    const updated = [...goals];
    updated[index] = value;
    setGoals(updated);
  };

  const addTechnology = () => setTechnologies([...technologies, '']);
  const removeTechnology = (index: number) => setTechnologies(technologies.filter((_, i) => i !== index));
  const updateTechnology = (index: number, value: string) => {
    const updated = [...technologies];
    updated[index] = value;
    setTechnologies(updated);
  };

  const addPlannedTechnology = () => setPlannedTechnologies([...plannedTechnologies, '']);
  const removePlannedTechnology = (index: number) => setPlannedTechnologies(plannedTechnologies.filter((_, i) => i !== index));
  const updatePlannedTechnology = (index: number, value: string) => {
    const updated = [...plannedTechnologies];
    updated[index] = value;
    setPlannedTechnologies(updated);
  };

  const addRole = () => setRolesNeeded([...rolesNeeded, {
    title: '',
    description: '',
    skills: [''],
    experienceLevel: '',
    commitmentExpected: '',
    isActive: true
  }]);

  const removeRole = (index: number) => setRolesNeeded(rolesNeeded.filter((_, i) => i !== index));

  const updateRole = (index: number, field: keyof Role, value: string | boolean) => {
    const updated = [...rolesNeeded];
    if (field === 'skills') return; // Handle skills separately
    if (field === 'isActive') {
      updated[index][field] = value as boolean;
    } else {
      updated[index][field] = value as string;
    }
    setRolesNeeded(updated);
  };

  const addRoleSkill = (roleIndex: number) => {
    const updated = [...rolesNeeded];
    updated[roleIndex].skills.push('');
    setRolesNeeded(updated);
  };

  const removeRoleSkill = (roleIndex: number, skillIndex: number) => {
    const updated = [...rolesNeeded];
    updated[roleIndex].skills = updated[roleIndex].skills.filter((_, i) => i !== skillIndex);
    setRolesNeeded(updated);
  };

  const updateRoleSkill = (roleIndex: number, skillIndex: number, value: string) => {
    const updated = [...rolesNeeded];
    updated[roleIndex].skills[skillIndex] = value;
    setRolesNeeded(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Share your project idea and find collaborators to help bring it to life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project in detail"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currentStatus">Current Status *</Label>
                <Textarea
                  id="currentStatus"
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({...formData, currentStatus: e.target.value})}
                  placeholder="What's the current state of your project?"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Goals</h3>
              {goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder="Enter a project goal"
                  />
                  {goals.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeGoal(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Technologies</h3>
              
              <div>
                <Label>Current Technologies *</Label>
                {technologies.map((tech, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={tech}
                      onChange={(e) => updateTechnology(index, e.target.value)}
                      placeholder="Enter technology"
                    />
                    {technologies.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeTechnology(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTechnology} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technology
                </Button>
              </div>

              <div>
                <Label>Planned Technologies (Optional)</Label>
                {plannedTechnologies.map((tech, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={tech}
                      onChange={(e) => updatePlannedTechnology(index, e.target.value)}
                      placeholder="Enter planned technology"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removePlannedTechnology(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addPlannedTechnology} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Planned Technology
                </Button>
              </div>
            </div>

            {/* Roles Needed */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Roles Needed</h3>
              {rolesNeeded.map((role, roleIndex) => (
                <Card key={roleIndex}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Role {roleIndex + 1}</CardTitle>
                      {rolesNeeded.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeRole(roleIndex)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Role Title</Label>
                        <Input
                          value={role.title}
                          onChange={(e) => updateRole(roleIndex, 'title', e.target.value)}
                          placeholder="e.g., Frontend Developer"
                        />
                      </div>
                      <div>
                        <Label>Experience Level</Label>
                        <Select value={role.experienceLevel} onValueChange={(value) => updateRole(roleIndex, 'experienceLevel', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Role Description</Label>
                      <Textarea
                        value={role.description}
                        onChange={(e) => updateRole(roleIndex, 'description', e.target.value)}
                        placeholder="Describe the role and responsibilities"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Required Skills</Label>
                      {role.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex gap-2 mt-2">
                          <Input
                            value={skill}
                            onChange={(e) => updateRoleSkill(roleIndex, skillIndex, e.target.value)}
                            placeholder="Enter required skill"
                          />
                          {role.skills.length > 1 && (
                            <Button type="button" variant="outline" size="icon" onClick={() => removeRoleSkill(roleIndex, skillIndex)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => addRoleSkill(roleIndex)} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>

                    <div>
                      <Label>Commitment Expected</Label>
                      <Input
                        value={role.commitmentExpected}
                        onChange={(e) => updateRole(roleIndex, 'commitmentExpected', e.target.value)}
                        placeholder="e.g., 10-15 hours per week"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addRole}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
              />
              <Label htmlFor="isPublic">Make this project public</Label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Project' : 'Create Project')
                }
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
