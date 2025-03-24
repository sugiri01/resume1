
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, BarChartHorizontal, PieChart, FileText, Download, Calendar, Filter } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useToast } from '@/hooks/use-toast';
import AnimatedCard from './AnimatedCard';
import TransitionLayout from './TransitionLayout';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

interface UploadHistory {
  filename: string;
  date: string;
  success: number;
  error: number;
  total: number;
}

interface ReportsPageProps {
  candidates: any[];
  uploadHistory: UploadHistory[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ candidates, uploadHistory }) => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState('all-time');

  // Pastel colors
  const pastelColors = [
    'rgba(229, 222, 255, 0.7)', // Soft Purple
    'rgba(211, 228, 253, 0.7)', // Soft Blue
    'rgba(209, 212, 249, 0.7)', // Soft Indigo
    'rgba(201, 247, 240, 0.7)', // Soft Teal
    'rgba(242, 252, 226, 0.7)', // Soft Green
    'rgba(254, 247, 205, 0.7)', // Soft Yellow
    'rgba(254, 198, 161, 0.7)', // Soft Orange
    'rgba(255, 222, 226, 0.7)', // Soft Pink
  ];
  
  const pastelBorders = [
    'rgba(186, 165, 255, 1)', // Purple
    'rgba(147, 189, 255, 1)', // Blue
    'rgba(166, 171, 241, 1)', // Indigo
    'rgba(134, 239, 221, 1)', // Teal
    'rgba(196, 239, 143, 1)', // Green
    'rgba(246, 230, 134, 1)', // Yellow
    'rgba(255, 173, 120, 1)', // Orange
    'rgba(255, 189, 196, 1)', // Pink
  ];

  // Technology distribution chart data
  const techData = React.useMemo(() => {
    const techCount: Record<string, number> = {};
    
    candidates.forEach(candidate => {
      if (candidate.Tech) {
        const techs = candidate.Tech.split(',').map((t: string) => t.trim());
        techs.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1;
        });
      }
    });
    
    const sortedTechs = Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      labels: sortedTechs.map(([tech]) => tech),
      datasets: [
        {
          label: 'Candidates',
          data: sortedTechs.map(([, count]) => count),
          backgroundColor: pastelColors,
          borderColor: pastelBorders,
          borderWidth: 1,
        },
      ],
    };
  }, [candidates]);

  // Location distribution chart data
  const locationData = React.useMemo(() => {
    const locationCount: Record<string, number> = {};
    
    candidates.forEach(candidate => {
      if (candidate.Location) {
        locationCount[candidate.Location] = (locationCount[candidate.Location] || 0) + 1;
      }
    });
    
    const sortedLocations = Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    return {
      labels: sortedLocations.map(([location]) => location),
      datasets: [
        {
          label: 'Candidates',
          data: sortedLocations.map(([, count]) => count),
          backgroundColor: pastelColors.slice(0, sortedLocations.length),
          borderColor: pastelBorders.slice(0, sortedLocations.length),
          borderWidth: 1,
        },
      ],
    };
  }, [candidates]);

  // Experience level distribution chart data
  const experienceData = React.useMemo(() => {
    const expRanges = [
      '0-2 years', 
      '3-5 years', 
      '6-8 years', 
      '9-12 years', 
      '13+ years'
    ];
    
    const expCounts = Array(expRanges.length).fill(0);
    
    candidates.forEach(candidate => {
      const exp = parseFloat(candidate['Number of Experience']) || 0;
      
      if (exp <= 2) expCounts[0]++;
      else if (exp <= 5) expCounts[1]++;
      else if (exp <= 8) expCounts[2]++;
      else if (exp <= 12) expCounts[3]++;
      else expCounts[4]++;
    });
    
    return {
      labels: expRanges,
      datasets: [
        {
          label: 'Candidates',
          data: expCounts,
          backgroundColor: pastelColors.slice(0, expRanges.length),
          borderColor: pastelBorders.slice(0, expRanges.length),
          borderWidth: 1,
        },
      ],
    };
  }, [candidates]);

  // Upload success rate data
  const uploadData = React.useMemo(() => {
    const labels = uploadHistory.map(history => {
      // Shorten filename for display
      const filename = history.filename.length > 15 
        ? history.filename.substring(0, 15) + '...' 
        : history.filename;
      return `${filename} (${history.date})`;
    }).reverse();
    
    const successData = uploadHistory.map(history => history.success).reverse();
    const errorData = uploadHistory.map(history => history.error).reverse();
    
    return {
      labels,
      datasets: [
        {
          label: 'Success',
          data: successData,
          backgroundColor: 'rgba(242, 252, 226, 0.7)', // Soft Green
          borderColor: 'rgba(196, 239, 143, 1)',
          borderWidth: 1,
        },
        {
          label: 'Errors',
          data: errorData,
          backgroundColor: 'rgba(255, 222, 226, 0.7)', // Soft Pink
          borderColor: 'rgba(255, 189, 196, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [uploadHistory]);

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "The report has been exported to CSV successfully.",
      variant: "default"
    });
  };

  const handleFilterChange = (filter: string) => {
    setTimeFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing data for ${filter.replace(/-/g, ' ')}`,
      variant: "default"
    });
  };

  return (
    <AnimatedCard
      title="Reports"
      className="max-w-6xl mx-auto"
      rightHeaderContent={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('this-week')}
            className={timeFilter === 'this-week' ? 'bg-brand-50' : ''}
          >
            <Calendar className="mr-2 h-4 w-4" /> This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('this-month')}
            className={timeFilter === 'this-month' ? 'bg-brand-50' : ''}
          >
            <Calendar className="mr-2 h-4 w-4" /> This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('all-time')}
            className={timeFilter === 'all-time' ? 'bg-brand-50' : ''}
          >
            <Filter className="mr-2 h-4 w-4" /> All Time
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={handleExportReport}
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="technology" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="technology" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Technology</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <BarChartHorizontal className="h-4 w-4" />
            <span>Experience</span>
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Upload Statistics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="technology">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Technology Distribution</CardTitle>
                <CardDescription>
                  Number of candidates by technology skill
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Bar 
                  data={techData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} candidates`;
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
        
        <TabsContent value="location">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Location Distribution</CardTitle>
                <CardDescription>
                  Candidate distribution by location
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex justify-center">
                <div className="w-full max-w-md">
                  <Pie 
                    data={locationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#334155',
                          bodyColor: '#334155',
                          borderColor: '#e2e8f0',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${context.label}: ${value} candidates (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
        
        <TabsContent value="experience">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Experience Distribution</CardTitle>
                <CardDescription>
                  Candidates grouped by years of experience
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Bar 
                  data={experienceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.x} candidates`;
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
        
        <TabsContent value="uploads">
          <TransitionLayout animationType="fade" delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Statistics</CardTitle>
                <CardDescription>
                  Success and error rates for data uploads
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Bar 
                  data={uploadData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                      }
                    },
                    plugins: {
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#334155',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TransitionLayout>
        </TabsContent>
      </Tabs>
    </AnimatedCard>
  );
};

export default ReportsPage;
