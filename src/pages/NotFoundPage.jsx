import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div className="container flex h-full items-center">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">
          Page not found!
        </h2>
        <p className="text-muted-foreground mb-4">
          Sorry, we couldn't find the page you requested.
        </p>
        <Button asChild>
          <Link to="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
export default NotFoundPage;