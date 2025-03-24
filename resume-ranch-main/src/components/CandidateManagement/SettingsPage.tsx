
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, Moon, Paintbrush, Save, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import AnimatedCard from './AnimatedCard';
import TransitionLayout from './TransitionLayout';

interface ColorOption {
  name: string;
  value: string;
  textColor: string;
}

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme || 'light');
  const [selectedColor, setSelectedColor] = useState('#6582c1'); // Default brand color

  // Effect to check for any stored color preferences
  useEffect(() => {
    const storedColor = localStorage.getItem('brandColor');
    if (storedColor) {
      setSelectedColor(storedColor);
      updateRootColors(storedColor);
    }
  }, []);

  const colorOptions: ColorOption[] = [
    { name: 'Blue (Default)', value: '#6582c1', textColor: 'text-white' },
    { name: 'Green', value: '#34D399', textColor: 'text-white' },
    { name: 'Purple', value: '#A78BFA', textColor: 'text-white' },
    { name: 'Orange', value: '#F97316', textColor: 'text-white' },
    { name: 'Teal', value: '#2DD4BF', textColor: 'text-white' },
    { name: 'Pink', value: '#EC4899', textColor: 'text-white' },
    { name: 'Red', value: '#EF4444', textColor: 'text-white' },
    { name: 'Yellow', value: '#F59E0B', textColor: 'text-black' },
  ];

  // Function to convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Function to generate lighter and darker shades
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
        const lightFactor = 1 - factor + 0.6; // Adjusted to make lighter colors more visible
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

  // Function to update CSS variables
  const updateRootColors = (color: string) => {
    const shades = generateShades(color);
    
    const root = document.documentElement;
    Object.entries(shades).forEach(([shade, value]) => {
      root.style.setProperty(`--brand-${shade}`, value);
    });
    
    // Also update the brand color in local storage
    localStorage.setItem('brandColor', color);
  };

  const handleSaveTheme = () => {
    setTheme(selectedTheme);
    updateRootColors(selectedColor);
    
    toast({
      title: "Theme Updated",
      description: "Your theme preferences have been saved.",
      variant: "default"
    });
  };

  return (
    <AnimatedCard
      title="Settings"
      className="max-w-4xl mx-auto"
    >
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-6">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>Customize the look and feel of Arete Talent Manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mode</h3>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={selectedTheme === 'light' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('light')}
                      className="flex-1 sm:flex-none justify-start relative"
                    >
                      <Sun className="mr-2 h-5 w-5" />
                      Light
                      {selectedTheme === 'light' && (
                        <Check className="w-4 h-4 absolute right-2 opacity-70" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('dark')}
                      className="flex-1 sm:flex-none justify-start relative"
                    >
                      <Moon className="mr-2 h-5 w-5" />
                      Dark
                      {selectedTheme === 'dark' && (
                        <Check className="w-4 h-4 absolute right-2 opacity-70" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={selectedTheme === 'system' ? 'default' : 'outline'}
                      onClick={() => setSelectedTheme('system')}
                      className="flex-1 sm:flex-none justify-start relative"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                      System
                      {selectedTheme === 'system' && (
                        <Check className="w-4 h-4 absolute right-2 opacity-70" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Primary Color</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={`cursor-pointer rounded-md p-2 relative flex items-center justify-center h-12 ${
                          selectedColor === color.value ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                      >
                        {selectedColor === color.value && (
                          <Check className={`h-6 w-6 ${color.textColor}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Color Preview:</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {[100, 300, 500, 700, 900].map((shade) => {
                        const shades = generateShades(selectedColor);
                        return (
                          <div 
                            key={shade} 
                            className="h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{ backgroundColor: shades[shade], color: shade < 500 ? '#000' : '#fff' }}
                          >
                            {shade}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSaveTheme} className="mt-6">
                  <Save className="mr-2 h-4 w-4" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
      </Tabs>
    </AnimatedCard>
  );
};

export default SettingsPage;
