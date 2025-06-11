'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  // Determine error type and message
  const getErrorInfo = () => {
    const message = error.message || 'An unexpected error occurred';
    
    // Check for common error patterns
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return {
        title: 'Server Error (500)',
        description: 'Our servers are experiencing some technical difficulties. Please try again in a few moments.',
        icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      };
    } else if (message.includes('502') || message.includes('Bad Gateway')) {
      return {
        title: 'Bad Gateway (502)',
        description: 'Unable to connect to our servers. This is usually temporary.',
        icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
      };
    } else if (message.includes('503') || message.includes('Service Unavailable')) {
      return {
        title: 'Service Unavailable (503)',
        description: 'Our service is temporarily unavailable. We\'re working to restore it.',
        icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
      };
    } else if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to process. Please try again.',
        icon: <AlertTriangle className="h-8 w-8 text-blue-500" />,
      };
    } else {
      return {
        title: 'Something went wrong',
        description: 'An unexpected error occurred while processing your request.',
        icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          {errorInfo.icon}
        </div>
        <h1 className="text-4xl font-bold mb-4">{errorInfo.title}</h1>
        <p className="text-xl text-muted-foreground mb-2">
          {errorInfo.description}
        </p>
        <p className="text-sm text-muted-foreground">
          If this problem persists, please contact our support team.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">What can you do?</CardTitle>
          <CardDescription>
            Try these options to resolve the issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={reset}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              size="lg"
              className="w-full"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              size="lg"
              className="w-full"
            >
              <Link href="/contact">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Technical Details (Development Only)
            </CardTitle>
            <CardDescription>
              This information is only visible in development mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Error:</strong>
                <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <strong>Error ID:</strong>
                  <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                    {error.digest}
                  </code>
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <div className="text-center mt-8 p-6 bg-muted/30 rounded-lg">
        <h3 className="font-semibold mb-2">Need immediate help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our support team is here to help you resolve any issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/help">
              View Help Center
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/feedback">
              Report Issue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
