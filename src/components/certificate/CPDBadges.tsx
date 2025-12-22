import { Award, CheckCircle, Star, Shield, BookOpen, Trophy } from 'lucide-react';

export interface CPDBadge {
  id: string;
  name: string;
  description: string;
  icon: 'award' | 'star' | 'shield' | 'book' | 'trophy' | 'check';
  color: string;
  hours?: number;
}

export const defaultCPDBadges: CPDBadge[] = [
  {
    id: 'cpd_certified',
    name: 'CPD Certified',
    description: 'Continuing Professional Development',
    icon: 'award',
    color: '#1e40af',
    hours: 10,
  },
  {
    id: 'accredited',
    name: 'Accredited Program',
    description: 'Industry Accredited Training',
    icon: 'shield',
    color: '#047857',
  },
  {
    id: 'excellence',
    name: 'Excellence Award',
    description: 'Outstanding Achievement',
    icon: 'trophy',
    color: '#b45309',
  },
  {
    id: 'professional',
    name: 'Professional Certification',
    description: 'Professional Standards Met',
    icon: 'star',
    color: '#7c3aed',
  },
];

const iconComponents = {
  award: Award,
  star: Star,
  shield: Shield,
  book: BookOpen,
  trophy: Trophy,
  check: CheckCircle,
};

interface CPDBadgeDisplayProps {
  badge: CPDBadge;
  size?: 'sm' | 'md' | 'lg';
}

export const CPDBadgeDisplay = ({ badge, size = 'md' }: CPDBadgeDisplayProps) => {
  const Icon = iconComponents[badge.icon];
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative`}
        style={{ 
          background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}40)`,
          border: `2px solid ${badge.color}`,
        }}
      >
        <Icon className={iconSizes[size]} style={{ color: badge.color }} />
        {/* Decorative ring */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            border: `1px solid ${badge.color}50`,
            transform: 'scale(1.15)',
          }}
        />
      </div>
      <p className="text-xs font-medium mt-1" style={{ color: badge.color }}>
        {badge.name}
      </p>
      {badge.hours && (
        <p className="text-xs text-muted-foreground">{badge.hours} CPD Hours</p>
      )}
    </div>
  );
};

interface CPDBadgeSelectorProps {
  selectedBadges: string[];
  onSelectBadge: (badgeId: string) => void;
}

export const CPDBadgeSelector = ({ selectedBadges, onSelectBadge }: CPDBadgeSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {defaultCPDBadges.map((badge) => {
        const isSelected = selectedBadges.includes(badge.id);
        return (
          <button
            key={badge.id}
            onClick={() => onSelectBadge(badge.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isSelected 
                ? 'border-accent bg-accent/10 ring-2 ring-accent/20' 
                : 'border-border hover:border-accent/50'
            }`}
          >
            <CPDBadgeDisplay badge={badge} size="sm" />
          </button>
        );
      })}
    </div>
  );
};
