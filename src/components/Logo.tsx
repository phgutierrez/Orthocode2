import { Bone } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} medical-gradient rounded-xl flex items-center justify-center shadow-lg`}>
        <Bone className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textClasses[size]} font-bold text-white leading-tight`}>
            TussPack
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-white/80">
              Códigos TUSS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
