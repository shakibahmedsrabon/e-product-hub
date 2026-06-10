import { usePathname } from "@/lib/navigation";
import { useEffect } from "react";
import AppLink from "@/lib/navigation/AppLink";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <AppLink href="/" className="text-foreground underline hover:text-muted-foreground">
          Return to Home
        </AppLink>
      </div>
    </div>
  );
};

export default NotFound;
