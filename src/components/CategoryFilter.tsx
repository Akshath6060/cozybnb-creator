import { cn } from '@/lib/utils';
import { 
  Palmtree, 
  Mountain, 
  Building2, 
  Waves, 
  TreePine, 
  Sun,
  Home
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

const categories: { name: Category; icon: React.ElementType }[] = [
  { name: 'All', icon: Home },
  { name: 'Beach', icon: Palmtree },
  { name: 'Mountain', icon: Mountain },
  { name: 'City', icon: Building2 },
  { name: 'Lake', icon: Waves },
  { name: 'Countryside', icon: TreePine },
  { name: 'Desert', icon: Sun },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 transition-all',
                selected === name
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium whitespace-nowrap">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
