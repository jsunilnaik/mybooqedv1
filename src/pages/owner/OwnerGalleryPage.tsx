import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOwnerStore } from '../../store/useOwnerStore';
import { salonService } from '../../lib/dataService';
import { useToast } from '../../components/ui/Toast';
import type { GalleryItem } from '../../types';
import { ImageUpload } from '../../components/ui/ImageUpload';

export default function OwnerGalleryPage() {
  const { salon } = useOwnerStore();
  const toast = useToast();
  
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  // Initial load
  useEffect(() => {
    if (salon) {
      // In a real app this would be an API call
      // For now we get the enriched salon that dataService builds
      const fullSalon = salonService.getById(salon.id);
      if (fullSalon && fullSalon.gallery) {
        setItems(fullSalon.gallery);
      }
    }
  }, [salon]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;
    if (!newImageUrl.trim() || !newCaption.trim()) {
      toast.error('Please provide both an image URL and a caption');
      return;
    }

    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      salonId: salon.id,
      imageUrl: newImageUrl.trim(),
      caption: newCaption.trim(),
      date: new Date().toISOString(),
    };

    // Update dataService (optimistic local update)
    if (salonService.addGalleryItem) {
      salonService.addGalleryItem(newItem);
    } else {
      // Fallback if dataService isn't updated yet, just update local state
      console.warn('dataService.addGalleryItem not implemented yet');
    }

    setItems([newItem, ...items]);
    setNewImageUrl('');
    setNewCaption('');
    setIsModalOpen(false);
    toast.success('Gallery image added successfully');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      if (salonService.deleteGalleryItem) {
        salonService.deleteGalleryItem(id);
      }
      setItems(items.filter(item => item.id !== id));
      toast.success('Image deleted successfully');
    }
  };

  if (!salon) return null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Our Gallery</h1>
          <p className="text-[#71717A] mt-1 text-sm">Manage your salon's portfolio and showcase your best work.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors flex-shrink-0"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1">No images yet</h3>
          <p className="text-[#71717A] text-sm max-w-sm mx-auto mb-6">
            Upload photos of your best haircuts, coloring, and styling to attract more clients.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            Add First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 absolute bottom-0 left-0 right-0 sm:translate-y-4 sm:group-hover:translate-y-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-semibold line-clamp-2 leading-snug mb-2 drop-shadow-md">
                    {item.caption}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                    <Calendar size={12} />
                    <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-black mb-6">Add Gallery Image</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <ImageUpload 
                      label="Upload Portfolio Image"
                      value={newImageUrl}
                      onChange={(url) => setNewImageUrl(url)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 font-medium">Capture or select a photo of your salon's professional work.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption</label>
                  <textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Describe this style or service..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    Upload Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
