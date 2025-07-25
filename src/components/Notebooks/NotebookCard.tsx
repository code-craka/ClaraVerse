import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  FileText, 
  MoreVertical, 
  Trash2, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { NotebookResponse } from '../../services/claraNotebookService';

interface NotebookCardProps {
  notebook: NotebookResponse;
  onOpen: () => void;
  onDelete: () => void;
}

const NotebookCard: React.FC<NotebookCardProps> = ({ notebook, onOpen, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 176 // 176px is menu width (w-44)
      });
    }
    
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Don't close if clicking on the button itself
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the dropdown menu
      const dropdown = document.querySelector('[data-dropdown-menu]');
      if (dropdown && dropdown.contains(target)) {
        return;
      }
      
      setShowMenu(false);
    };

    // Use a small delay to ensure the portal menu is rendered
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);



  return (
    <div 
      onClick={onOpen}
      className="group p-4 glassmorphic-card rounded-xl border border-white/30 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-500 hover:shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-sakura-100 dark:bg-sakura-900/20 rounded-lg flex-shrink-0">
            <BookOpen className="w-4 h-4 text-sakura-600 dark:text-sakura-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {notebook.name}
          </h3>
        </div>
        
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleMenuClick}
            className="p-1.5 rounded-md opacity-30 group-hover:opacity-100 hover:bg-white/20 dark:hover:bg-gray-600/50 transition-all duration-200"
          >
            <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Portal Menu - Rendered outside the card hierarchy */}
        {showMenu && createPortal(
          <div
            data-dropdown-menu
            className="fixed w-44 glassmorphic-card rounded-lg shadow-xl border border-white/30 dark:border-gray-700/50 py-2 backdrop-blur-md z-[99999]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Start Chat
            </button>
            <div className="border-t border-gray-200/30 dark:border-gray-600/30 my-1"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                if (window.confirm(`Are you sure you want to delete "${notebook.name}"?`)) {
                  onDelete();
                }
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Notebook
            </button>
          </div>,
          document.body
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {notebook.description || 'No description provided'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>{notebook.document_count} document{notebook.document_count !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Created {formatDate(notebook.created_at)}</span>
        </div>
      </div>


    </div>
  );
};

export default NotebookCard; 