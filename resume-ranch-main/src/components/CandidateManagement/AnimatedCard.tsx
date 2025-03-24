
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionLayout from './TransitionLayout';

interface AnimatedCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  animationDelay?: number;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
  rightHeaderContent?: ReactNode;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  animationDelay = 0,
  animationType = 'scale',
  rightHeaderContent
}) => {
  return (
    <TransitionLayout animationType={animationType} delay={animationDelay}>
      <Card className={`subtle-shadow hover:shadow-md premium-transition backdrop-blur-sm ${className}`}>
        {title && (
          <CardHeader className={`pb-4 flex flex-row items-center justify-between ${headerClassName}`}>
            <CardTitle className="text-brand-800 font-medium">{title}</CardTitle>
            {rightHeaderContent && rightHeaderContent}
          </CardHeader>
        )}
        <CardContent className={contentClassName}>
          {children}
        </CardContent>
      </Card>
    </TransitionLayout>
  );
};

export default AnimatedCard;
