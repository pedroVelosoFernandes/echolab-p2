import { Star, MoreHorizontal, Lightbulb } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  onTutorialClick?: () => void;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite,
  showMenu = false,
  onMenuClick,
  onTutorialClick,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 h-16 flex-shrink-0 border-b border-[#242526]">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-medium text-foreground">{title}</h1>
        {showFavorite && (
          <button
            onClick={onToggleFavorite}
            className="text-muted-foreground hover:text-[#f2c94c] transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
        {onTutorialClick && (
          <button
            onClick={onTutorialClick}
            className="text-muted-foreground hover:text-yellow-500 transition-colors"
            title="Start tutorial"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}