
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cva } from 'class-variance-authority';

const iconContainerVariants = cva(
  "rounded-full p-3 subtle-shadow flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-white/90",
        purple: "bg-brand-100",
        blue: "bg-blue-100",
        green: "bg-green-100",
        amber: "bg-amber-100",
        indigo: "bg-indigo-100",
        teal: "bg-teal-100",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const iconColorVariants = cva("h-6 w-6", {
  variants: {
    variant: {
      default: "text-brand-500",
      purple: "text-brand-600",
      blue: "text-blue-600",
      green: "text-green-600",
      amber: "text-amber-600",
      indigo: "text-indigo-600",
      teal: "text-teal-600",
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

type ChartType = 'area' | 'bar';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  data?: Array<{name: string; value: number}>;
  chartType?: ChartType;
  description?: string;
  className?: string;
  variant?: 'default' | 'purple' | 'blue' | 'green' | 'amber' | 'indigo' | 'teal';
  pastelColor?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  data = [],
  chartType = 'area',
  description,
  className = '',
  variant = 'default',
  pastelColor,
  onClick
}) => {
  const renderChart = () => {
    if (!data.length) return null;
    
    // Use pastel color from props, or derive from variant if not provided
    const chartColor = pastelColor || 
      (variant === 'default' ? '#E5DEFF' : `var(--${variant}-300)`);
    
    const fillColor = pastelColor || 
      (variant === 'default' ? '#F1F0FB' : `var(--${variant}-100)`);
    
    switch (chartType) {
      case 'area':
        return (
          <ChartContainer 
            config={{ data: { label: 'Value', theme: { light: '#E5E7EB', dark: '#374151' } } }}
            className="h-24"
          >
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${title})`}
              />
            </AreaChart>
          </ChartContainer>
        );
      case 'bar':
        return (
          <ChartContainer 
            config={{ data: { label: 'Value', theme: { light: '#E5E7EB', dark: '#374151' } } }}
            className="h-24"
          >
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="value" 
                fill={chartColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`hover-lift overflow-hidden transition-all duration-300 ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardDescription className="text-brand-500 mb-1 font-medium">{title}</CardDescription>
            <CardTitle className="text-3xl font-semibold text-brand-800">{value}</CardTitle>
          </div>
          <div className={iconContainerVariants({ variant })}>
            {React.isValidElement(icon) && 
              React.cloneElement(icon as React.ReactElement, {
                className: iconColorVariants({ variant })
              })
            }
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        {renderChart()}
        {description && (
          <div className="mt-2 px-6 pb-4 text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
