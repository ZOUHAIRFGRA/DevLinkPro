"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface SkillsManagerProps {
  initialSkills?: Skill[];
  onChange: (skills: Skill[]) => void;
}

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

// Popular technical skills suggestions
const popularSkills = [
  // Frontend
  "React", "Vue.js", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS",
  "Next.js", "Nuxt.js", "Redux", "Vuex", "jQuery", "Bootstrap", "SASS/SCSS",
  
  // Backend
  "Node.js", "Python", "Java", "C#", "PHP", "Ruby", "Go", "Rust", "Kotlin", "Swift",
  "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET", "Ruby on Rails",
  
  // Databases
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Oracle",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions",
  "Terraform", "Ansible", "CI/CD", "Linux", "Shell Scripting",
  
  // Mobile
  "React Native", "Flutter", "Ionic", "Xamarin",
  
  // Other
  "Git", "GraphQL", "REST APIs", "Microservices", "UI/UX Design", "Figma", "Adobe XD",
  "Machine Learning", "Data Science", "Blockchain", "WebRTC", "Socket.io"
];

export function SkillsManager({ initialSkills = [], onChange }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [newSkill, setNewSkill] = useState({ name: "", level: "Beginner" as const });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const isInitialized = useRef(false);

  // Update local skills when initialSkills changes
  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  // Only call onChange when skills actually change after initialization
  useEffect(() => {
    if (isInitialized.current) {
      onChange(skills);
    } else {
      isInitialized.current = true;
    }
  }, [skills, onChange]);

  useEffect(() => {
    if (newSkill.name.trim()) {
      const filtered = popularSkills.filter(skill => 
        skill.toLowerCase().includes(newSkill.name.toLowerCase()) &&
        !skills.some(existingSkill => 
          existingSkill.name.toLowerCase() === skill.toLowerCase()
        )
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [newSkill.name, skills]);

  const addSkill = (skillName?: string) => {
    const name = skillName || newSkill.name.trim();
    if (name) {
      // Check if skill already exists
      const exists = skills.some(
        skill => skill.name.toLowerCase() === name.toLowerCase()
      );
      
      if (!exists) {
        setSkills([...skills, { name, level: newSkill.level }]);
        setNewSkill({ name: "", level: "Beginner" });
        setShowSuggestions(false);
      }
    }
  };

  const handleAddClick = () => {
    addSkill();
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddClick();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Advanced":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Add new skill */}
      <div className="relative">
        <div className="flex items-center gap-4 p-3 border rounded-lg">
          <Input
            placeholder="Skill name (e.g., React, Node.js, Python)"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (filteredSuggestions.length > 0) setShowSuggestions(true);
            }}
            className="flex-1"
          />
          <Select
            value={newSkill.level}
            onValueChange={(value) => 
              setNewSkill({ ...newSkill, level: value as typeof newSkill.level })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddClick} size="sm" disabled={!newSkill.name.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Skill suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
              <div className="space-y-1">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded text-foreground"
                    onClick={() => addSkill(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="p-3 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">
            Popular skill suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => addSkill(skill)}
                className="whitespace-nowrap"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Current skills */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Current Skills</h4>
          <div className="grid gap-2">
            {skills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{skill.name}</span>
                  <Badge className={getLevelColor(skill.level)}>
                    {skill.level}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSkill(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No skills added yet. Add your first skill above!</p>
        </div>
      )}
    </div>
  );
}
