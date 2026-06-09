import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUpdateLibraryConfig } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const updateConfig = useUpdateLibraryConfig();
  const { admin } = useAuth();
  const queryClient = useQueryClient();

  const handleToggle = () => {
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // If logged in, save to database
    if (admin) {
      updateConfig.mutate({ data: { theme: newTheme } }, {
        onSuccess: () => {
          queryClient.invalidateQueries();
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
