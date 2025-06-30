
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  errorInfo?: React.ErrorInfo;
}

export function ErrorFallback({ error, resetErrorBoundary, errorInfo }: ErrorFallbackProps) {
  const errorMessage = error.message || "An unexpected error occurred";
  const errorStack = error.stack || "";
  
  return (
    <div className="container flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader className="bg-red-50 dark:bg-red-950 rounded-t-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />
            <CardTitle id="error-title">Something went wrong</CardTitle>
          </div>
          <CardDescription className="text-red-700 dark:text-red-300" aria-describedby="error-title">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Error details:</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs overflow-auto max-h-32">
              <pre>{errorStack}</pre>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
          
          {resetErrorBoundary && (
            <Button 
              onClick={resetErrorBoundary}
              variant="default"
            >
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ErrorFallback;
