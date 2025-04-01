import React from 'react';
import { BookMarked, Video, Newspaper, Globe, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { FeedItem as FeedItemType, useFeedStore } from '../store/feedStore';

interface FeedItemProps extends FeedItemType {
  showBookmark?: boolean;
}

const FeedItem: React.FC<FeedItemProps> = ({ 
  type, 
  source, 
  title, 
  time, 
  project, 
  url,
  id,
  thumbnail,
  showBookmark = true 
}) => {
  const { toggleBookmark, isBookmarked } = useFeedStore();
  const bookmarked = isBookmarked(id);
  const icons = {
    article: Newspaper,
    video: Video,
    blog: Globe,
    bookmark: BookMarked,
  };
  
  const Icon = icons[type];
  
  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  return (
    <div className="group bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-zinc-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon size={18} className="text-zinc-400 flex-shrink-0" />
              <span className="text-sm text-blue-400 truncate">{project}</span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-500 truncate">{source}</span>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <span className="text-xs text-zinc-500">{time}</span>
              {showBookmark && (
                <button
                  onClick={() => toggleBookmark(id)}
                  className={`${bookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity p-1 rounded-lg ${
                    bookmarked ? 'text-yellow-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookMarked size={16} />
                </button>
              )}
            </div>
          </div>
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 font-medium hover:text-blue-400 transition-colors block truncate"
            title={title}
          >
            {truncateText(title)}
          </a>
        </div>
      </div>
    </div>
  );
};

interface FeedProps {
  onViewAll?: () => void;
  items?: FeedItemType[];
  showViewAll?: boolean;
}

const Feed: React.FC<FeedProps> = ({ onViewAll, items, showViewAll = true }) => {
  const { feedItems } = useFeedStore();
  const displayItems = items || feedItems.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Feed</h2>
        {showViewAll && onViewAll && (
          <button 
            onClick={onViewAll}
            className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayItems.map((item) => (
          <FeedItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Feed;