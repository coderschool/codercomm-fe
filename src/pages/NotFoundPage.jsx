import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

/**
 * Not Found (404) page component.
 * Displayed when a user navigates to a route that doesn't exist.
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen p-6">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you are looking for doesn't seem to exist. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Button asChild size="lg">
        <Link to="/">
          <Home className="mr-2 h-5 w-5" />
          Go Back Home
        </Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;