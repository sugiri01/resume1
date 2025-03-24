
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Use meta for error handling in latest version of react-query
      meta: {
        onError: (error: any) => {
          console.error('Query error:', error);
          if (error?.message?.includes('role "super_admin" does not exist')) {
            console.warn('Role error detected - this is a PostgreSQL role error, not related to application roles');
          }
        }
      }
    },
  },
});

// Initialize the theme
const initializeTheme = () => {
  // Check for stored brand color and apply it
  const storedColor = localStorage.getItem('brandColor');
  if (storedColor) {
    const root = document.documentElement;
    const updateRootColors = (color: string) => {
      // Function to convert hex to RGB
      const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      // Function to generate shades
      const generateShades = (hex: string): { [key: number]: string } => {
        const rgb = hexToRgb(hex);
        if (!rgb) return {};

        const { r, g, b } = rgb;
        const shades: { [key: number]: string } = {};

        // Generate shades (100-900)
        for (let i = 1; i <= 9; i++) {
          const factor = i * 0.1;
          // For lighter shades (100-400)
          if (i <= 4) {
            const lightFactor = 1 - factor + 0.6;
            shades[i * 100] = `rgb(${Math.min(255, Math.round(r * lightFactor + (255 - r) * (1 - lightFactor)))}, ${Math.min(255, Math.round(g * lightFactor + (255 - g) * (1 - lightFactor)))}, ${Math.min(255, Math.round(b * lightFactor + (255 - b) * (1 - lightFactor)))})`;
          }
          // Primary color (500)
          else if (i === 5) {
            shades[i * 100] = `rgb(${r}, ${g}, ${b})`;
          }
          // For darker shades (600-900)
          else {
            const darkFactor = 1 - (i - 5) * 0.2;
            shades[i * 100] = `rgb(${Math.round(r * darkFactor)}, ${Math.round(g * darkFactor)}, ${Math.round(b * darkFactor)})`;
          }
        }

        return shades;
      };

      const shades = generateShades(color);
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--brand-${shade}`, value);
      });
    };

    updateRootColors(storedColor);
  }
};

const App = () => {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
