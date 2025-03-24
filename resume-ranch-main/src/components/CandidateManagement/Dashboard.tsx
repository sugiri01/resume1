
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, FileSpreadsheet, Code, MapPin, Briefcase, Clock, Download, Filter, Plus, FileText, BarChart } from 'lucide-react';
import TransitionLayout from './TransitionLayout';
import MetricCard from './MetricCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Column {
  field: string;
  display: string;
  icon: React.ReactNode;
  type: string;
}

interface Candidate {
  [key: string]: string;
}

interface DashboardProps {
  candidates: Candidate[];
  columns: Column[];
  onViewAll: () => void;
  onUpload: () => void;
  onAddCandidate: () => void;
  onRunReport: () => void;
  onFilterChange?: (filter: string) => void;
  userRole?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  candidates, 
  columns, 
  onViewAll, 
  onUpload,
  onAddCandidate,
  onRunReport,
  onFilterChange,
  userRole = 'user'
}) => {
  // Generate sample data for metrics
  const generateMetricData = (length = 7, max = 100, min = 0, trend: 'up' | 'down' | 'random' = 'random') => {
    return Array.from({ length }, (_, i) => {
      let value;
      if (trend === 'up') {
        value = min + ((max - min) * i / (length - 1)) + (Math.random() * 10 - 5);
      } else if (trend === 'down') {
        value = max - ((max - min) * i / (length - 1)) + (Math.random() * 10 - 5);
      } else {
        value = min + Math.random() * (max - min);
      }
      return {
        name: `Day ${i + 1}`,
        value: Math.max(min, Math.min(max, Math.round(value)))
      };
    });
  };

  // Calculate stats
  const uniqueTechs = new Set(candidates.map(c => c.Tech)).size;
  const uniqueLocations = new Set(candidates.map(c => c.Location)).size;
  const uniqueCompanies = new Set(candidates.map(c => c['Which Company working'])).size;
  
  // Get average experience
  const avgExperience = candidates.length > 0 
    ? candidates.reduce((sum, c) => {
        const exp = parseFloat(c['Number of Experience']) || 0;
        return sum + exp;
      }, 0) / candidates.length
    : 0;

  // Get tech breakdown
  const techBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      if (c.Tech) {
        const techs = c.Tech.split(',').map(t => t.trim());
        techs.forEach(tech => {
          counts[tech] = (counts[tech] || 0) + 1;
        });
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [candidates]);

  // Get locations breakdown
  const locationBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      if (c.Location) {
        counts[c.Location] = (counts[c.Location] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [candidates]);

  // Use pastel colors for chart data
  const pastelColors = {
    purple: '#E5DEFF', // Soft Purple
    blue: '#D3E4FD',   // Soft Blue
    indigo: '#D1D4F9', // Soft Indigo
    teal: '#C9F7F0',   // Soft Teal
    green: '#F2FCE2',  // Soft Green
    yellow: '#FEF7CD', // Soft Yellow
    orange: '#FEC6A1', // Soft Orange
    pink: '#FFDEE2',   // Soft Pink
    peach: '#FDE1D3',  // Soft Peach
    gray: '#F1F0FB',   // Soft Gray
  };

  const metricCards = [
    { 
      title: 'Total Candidates', 
      value: candidates.length, 
      icon: <UserPlus />,
      data: generateMetricData(7, candidates.length, 0, 'up'),
      chartType: 'area' as const,
      variant: 'purple' as const,
      delay: 100,
      pastelColor: pastelColors.purple
    },
    { 
      title: 'Technologies', 
      value: uniqueTechs, 
      icon: <Code />,
      data: techBreakdown,
      chartType: 'bar' as const,
      variant: 'blue' as const,
      delay: 200,
      pastelColor: pastelColors.blue
    },
    { 
      title: 'Locations', 
      value: uniqueLocations, 
      icon: <MapPin />,
      data: locationBreakdown,
      chartType: 'bar' as const,
      variant: 'indigo' as const,
      delay: 300,
      pastelColor: pastelColors.indigo
    },
    { 
      title: 'Avg. Experience', 
      value: `${avgExperience.toFixed(1)} yrs`, 
      icon: <Clock />,
      data: generateMetricData(7, 10, 3, 'random'),
      chartType: 'area' as const,
      variant: 'teal' as const,
      delay: 400,
      pastelColor: pastelColors.teal
    }
  ];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get random avatar color
  const getAvatarColor = (name: string) => {
    const colors = ['bg-brand-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-indigo-500', 'bg-teal-500'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Determine if user can add candidates based on role
  const canAddCandidate = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="space-y-8">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-brand-800">Overview</h2>
        
        {onFilterChange && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFilterChange('this-week')}
              className="text-xs"
            >
              This Week
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFilterChange('this-month')}
              className="text-xs"
            >
              This Month
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFilterChange('all-time')}
              className="text-xs"
            >
              All Time
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" /> More
            </Button>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat) => (
          <TransitionLayout 
            key={stat.title} 
            animationType="scale" 
            delay={stat.delay}
          >
            <MetricCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              data={stat.data}
              chartType={stat.chartType}
              variant={stat.variant}
              pastelColor={stat.pastelColor}
            />
          </TransitionLayout>
        ))}
      </div>

      {/* Quick Actions */}
      <TransitionLayout animationType="fade" delay={500}>
        <Card className="bg-gradient-to-br from-brand-100 to-white border-brand-200">
          <CardHeader>
            <CardTitle className="text-lg text-brand-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {canAddCandidate && (
              <Button 
                onClick={onAddCandidate}
                className="bg-brand-500 hover:bg-brand-600 text-white flex flex-col items-center justify-center h-24 rounded-lg shadow-sm"
              >
                <UserPlus size={28} className="mb-2" />
                <span>Add Candidate</span>
              </Button>
            )}
            {canAddCandidate && (
              <Button 
                onClick={onUpload}
                className="bg-brand-600 hover:bg-brand-700 text-white flex flex-col items-center justify-center h-24 rounded-lg shadow-sm"
              >
                <FileSpreadsheet size={28} className="mb-2" />
                <span>Upload Data</span>
              </Button>
            )}
            <Button 
              onClick={onRunReport}
              className="bg-brand-700 hover:bg-brand-800 text-white flex flex-col items-center justify-center h-24 rounded-lg shadow-sm"
            >
              <FileText size={28} className="mb-2" />
              <span>Run Reports</span>
            </Button>
            <Button 
              onClick={onViewAll}
              className="bg-brand-800 hover:bg-brand-900 text-white flex flex-col items-center justify-center h-24 rounded-lg shadow-sm"
            >
              <BarChart size={28} className="mb-2" />
              <span>View Analytics</span>
            </Button>
          </CardContent>
        </Card>
      </TransitionLayout>

      {/* Recent Candidates */}
      {candidates.length > 0 ? (
        <TransitionLayout 
          delay={600}
          animationType="slide-up"
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-brand-50 border-b border-brand-100">
              <CardTitle className="text-lg text-brand-800">Recent Candidates</CardTitle>
              <Button 
                size="sm" 
                onClick={onViewAll}
                className="bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {candidates.slice(0, 6).map((candidate, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={candidate.Name} />
                        <AvatarFallback className={getAvatarColor(candidate.Name)}>
                          {getInitials(candidate.Name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{candidate.Name}</h4>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span className="truncate">{candidate['Which Company working'] || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.Tech && candidate.Tech.split(',').slice(0, 2).map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-brand-50">
                              {tech.trim()}
                            </Badge>
                          ))}
                          {candidate.Tech && candidate.Tech.split(',').length > 2 && (
                            <Badge variant="outline" className="text-xs bg-brand-50">
                              +{candidate.Tech.split(',').length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TransitionLayout>
      ) : (
        <TransitionLayout 
          delay={600}
          animationType="slide-up"
          className="py-12"
        >
          <Card className="border-dashed border-2 border-brand-200 bg-brand-50/50">
            <CardContent className="text-center p-8">
              <TransitionLayout animationType="slide-down" delay={600}>
                <div className="inline-flex rounded-full bg-brand-100 p-6 mb-6">
                  <FileSpreadsheet size={48} className="text-brand-500" />
                </div>
              </TransitionLayout>
              <TransitionLayout animationType="fade" delay={800}>
                <h3 className="text-xl font-medium text-brand-800 mb-3">No candidate data available</h3>
                <p className="text-brand-500 mb-8 max-w-md mx-auto">
                  Upload your candidate data to get started with insights and management.
                </p>
                {canAddCandidate && (
                  <Button 
                    onClick={onUpload}
                    className="bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Upload Data
                  </Button>
                )}
              </TransitionLayout>
            </CardContent>
          </Card>
        </TransitionLayout>
      )}
    </div>
  );
};

export default Dashboard;
