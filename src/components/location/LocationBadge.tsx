import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { useLocationStore } from '../../store/useLocationStore'
import { LocationModal } from './LocationModal'

export function LocationBadge() {
  const { area, city, isDetecting } = useLocationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isDetecting) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        <span>Detecting...</span>
      </div>
    )
  }

  const displayLocation = area || city || 'India'

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors"
      >
        <MapPin size={14} className="text-gray-400" />
        <span className="border-b border-dotted border-gray-400 hover:border-black">{displayLocation}</span>
      </button>
      <LocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
