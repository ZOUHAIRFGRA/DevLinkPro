'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X } from 'lucide-react';

interface ProjectFiltersProps {
  onFiltersChange: (filters: ProjectFilters) => void;
}

export interface ProjectFilters {
  search: string;
  technologies: string[];
  category: string;
  difficulty: string;
  status: string;
}

const TECHNOLOGY_OPTIONS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
  'JavaScript', 'TypeScript', 'Go', 'Rust', 'PHP', 'Laravel',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Unity', 'Unreal Engine'
];

const CATEGORY_OPTIONS = [
  'Web Development', 'Mobile Development', 'Desktop Application',
  'Game Development', 'Data Science', 'Machine Learning', 'AI',
  'Blockchain', 'IoT', 'DevOps', 'Cybersecurity', 'API Development',
  'E-commerce', 'Social Media', 'Educational', 'Healthcare',
  'Finance', 'Entertainment', 'Productivity', 'Open Source'
];

export default function ProjectFilters({ onFiltersChange }: ProjectFiltersProps) {
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    technologies: [],
    category: '',
    difficulty: '',
    status: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [techInput, setTechInput] = useState('');

  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const addTechnology = (tech: string) => {
    if (tech && !filters.technologies.includes(tech)) {
      updateFilters({
        technologies: [...filters.technologies, tech]
      });
    }
    setTechInput('');
  };

  const removeTechnology = (tech: string) => {
    updateFilters({
      technologies: filters.technologies.filter(t => t !== tech)
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: ProjectFilters = {
      search: '',
      technologies: [],
      category: '',
      difficulty: '',
      status: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setTechInput('');
  };

  const hasActiveFilters = filters.search || filters.technologies.length > 0 || 
    filters.category || filters.difficulty || filters.status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Projects
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div>
          <Label htmlFor="search">Search Projects</Label>
          <Input
            id="search"
            placeholder="Search by title, description, or keywords..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Technology Selection */}
        <div>
          <Label htmlFor="technologies">Technologies</Label>
          <div className="mt-1 space-y-2">
            <Input
              id="technologies"
              placeholder="Type to add technologies..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechnology(techInput.trim());
                }
              }}
            />
            
            {/* Technology Suggestions */}
            {techInput && (
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 border rounded-md bg-muted/50">
                {TECHNOLOGY_OPTIONS
                  .filter(tech => 
                    tech.toLowerCase().includes(techInput.toLowerCase()) &&
                    !filters.technologies.includes(tech)
                  )
                  .slice(0, 10)
                  .map(tech => (
                    <Button
                      key={tech}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addTechnology(tech)}
                    >
                      {tech}
                    </Button>
                  ))
                }
              </div>
            )}

            {/* Selected Technologies */}
            {filters.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.technologies.map(tech => (
                  <Badge key={tech} variant="default" className="cursor-pointer">
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAdvanced && (
          <>
            <Separator />
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={filters.category || 'any'} onValueChange={(value) => updateFilters({ category: value === 'any' ? '' : value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any category</SelectItem>
                    {CATEGORY_OPTIONS.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={filters.difficulty || 'any'} onValueChange={(value) => updateFilters({ difficulty: value === 'any' ? '' : value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Project Status</Label>
                <Select value={filters.status || 'any'} onValueChange={(value) => updateFilters({ status: value === 'any' ? '' : value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground">
            Active filters: {filters.search && 'Search'}{filters.search && (filters.technologies.length > 0 || filters.category || filters.difficulty || filters.status) && ', '}
            {filters.technologies.length > 0 && `${filters.technologies.length} technologies`}{filters.technologies.length > 0 && (filters.category || filters.difficulty || filters.status) && ', '}
            {filters.category && 'Category'}{filters.category && (filters.difficulty || filters.status) && ', '}
            {filters.difficulty && 'Difficulty'}{filters.difficulty && filters.status && ', '}
            {filters.status && 'Status'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
