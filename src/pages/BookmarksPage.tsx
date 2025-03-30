import React from 'react';
import { useFeedStore } from '../store/feedStore';
import { BookMarked, Video, Newspaper, Globe, Image as ImageIcon } from 'lucide-react';

interface BookmarksPageProps {
  onPageChange: (page: 'home') => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = () => {
  const { getBookmarkedItems, toggleBookmark } = useFeedStore();
  const bookmarkedItems = getBookmarkedItems();

  const icons = {
    article: Newspaper,
    video: Video,
    blog: Globe,
    bookmark: BookMarked,
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Bookmarks</h1>
        {bookmarkedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">No bookmarks yet</p>
            <p className="text-sm text-zinc-500 mt-2">
              Save interesting articles, videos, and blog posts for later
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedItems.map((item) => {
              const Icon = icons[item.type];
              
              return (
                <div key={item.id} className="group bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} className="text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon size={18} className="text-zinc-400" />
                          <span className="text-sm text-blue-400">{item.project}</span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-500">{item.source}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-zinc-500">{item.time}</span>
                          <button
                            onClick={() => toggleBookmark(item.id)}
                            className="p-1 rounded-lg text-yellow-500 hover:bg-zinc-700"
                          >
                            <BookMarked size={16} />
                          </button>
                        </div>
                      </div>
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 font-medium hover:text-blue-400 transition-colors block"
                      >
                        {item.title}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;