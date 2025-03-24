
import React from 'react';

interface TransitionLayoutProps {
  children: React.ReactNode;
  show?: boolean;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur' | 'none';
  delay?: number;
  className?: string;
}

const TransitionLayout: React.FC<TransitionLayoutProps> = ({
  children,
  show = true,
  animationType = 'none',
  delay = 0,
  className
}) => {
  if (!show) return null;
  
  // Now we'll add actual animations instead of just returning children
  const getAnimationClass = () => {
    switch (animationType) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'scale':
        return 'animate-scale-in';
      case 'blur':
        return 'animate-blur-in';
      default:
        return '';
    }
  };
  
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};
  
  return (
    <div className={`${getAnimationClass()} ${className || ''}`} style={delayStyle}>
      {children}
    </div>
  );
};

export default TransitionLayout;
