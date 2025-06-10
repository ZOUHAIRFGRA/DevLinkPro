"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb, Bug, Heart, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Thank you for your feedback! We appreciate your input.");
    setIsSubmitting(false);
    
    // Reset form
    (e.target as HTMLFormElement).reset();
    setRating("");
  };

  const renderStars = (value: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Feedback & Suggestions</h1>
        <p className="text-xl text-muted-foreground">
          Help us improve DevLink with your valuable feedback
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Feedback Types */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Feature Request
              </CardTitle>
              <CardDescription>
                Suggest new features or improvements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bug className="h-5 w-5 text-red-500" />
                Bug Report
              </CardTitle>
              <CardDescription>
                Report issues or problems you&apos;ve encountered
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-pink-500" />
                General Feedback
              </CardTitle>
              <CardDescription>
                Share your overall experience and thoughts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                User Experience
              </CardTitle>
              <CardDescription>
                Help us improve the user interface and flow
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Feedback Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
              <CardDescription>
                Your feedback helps us build a better platform for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Feedback Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Brief summary of your feedback"
                    required 
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={6}
                    placeholder="Provide detailed information about your feedback, suggestions, or the issue you encountered..."
                    required 
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <RadioGroup name="priority" defaultValue="medium">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low - Nice to have</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium - Would improve experience</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High - Important for usability</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="critical" id="critical" />
                      <Label htmlFor="critical">Critical - Blocking functionality</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Overall Rating */}
                <div className="space-y-2">
                  <Label>Overall Experience Rating</Label>
                  <RadioGroup 
                    value={rating} 
                    onValueChange={setRating}
                    name="rating"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                        <Label htmlFor={`rating-${value}`} className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(value)}
                          </div>
                          <span>
                            {value === 1 && "Poor"}
                            {value === 2 && "Fair"}
                            {value === 3 && "Good"}
                            {value === 4 && "Very Good"}
                            {value === 5 && "Excellent"}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide your email if you&apos;d like us to follow up on your feedback
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Why Your Feedback Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Community-Driven Development</h3>
              <p className="text-sm text-muted-foreground">
                DevLink is built by developers, for developers. Your feedback directly 
                influences our roadmap and helps us prioritize features that matter most 
                to our community.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Transparent Process</h3>
              <p className="text-sm text-muted-foreground">
                We review all feedback and provide updates on our progress. You can track 
                the status of your suggestions and see how they&apos;re being implemented.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
