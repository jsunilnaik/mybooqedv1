import React from 'react';
import { 
  Scissors, Paintbrush, Sparkles, Smile, Wind, 
  Eye, Hand, Heart, Leaf, Crown, Star, 
  Flower2, User, Zap, ScanFace, Search
} from 'lucide-react';

export interface CategoryMetaItem {
  bg: string;
  color: string;
  Icon: React.ElementType;
}

export const CATEGORY_META: Record<string, CategoryMetaItem> = {
  'haircut-styling':   { bg: 'rgba(168,85,247,0.08)', color: '#A855F7', Icon: Scissors },
  'hair-color':        { bg: 'rgba(225,29,72,0.08)',  color: '#E11D48', Icon: Paintbrush },
  'hair-treatment':    { bg: 'rgba(59,130,246,0.08)', color: '#3B82F6', Icon: Sparkles },
  'facial-cleanup':    { bg: 'rgba(249,115,22,0.08)', color: '#F97316', Icon: Smile },
  'waxing':            { bg: 'rgba(16,185,129,0.08)', color: '#10B981', Icon: Wind },
  'threading':         { bg: 'rgba(217,70,239,0.08)', color: '#D946EF', Icon: Eye },
  'manicure-pedicure': { bg: 'rgba(99,102,241,0.08)', color: '#6366F1', Icon: Hand },
  'massage':           { bg: 'rgba(239,68,68,0.08)',  color: '#EF4444', Icon: Heart },
  'spa-wellness':      { bg: 'rgba(14,165,233,0.08)', color: '#0EA5E9', Icon: Leaf },
  'bridal-packages':   { bg: 'rgba(245,158,11,0.08)', color: '#F59E0B', Icon: Crown },
  'makeup':            { bg: 'rgba(168,85,247,0.08)', color: '#A855F7', Icon: Star },
  'mehendi':           { bg: 'rgba(5,150,105,0.08)',  color: '#059669', Icon: Flower2 },
  'beard-grooming':    { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB', Icon: User },
  'body-care':         { bg: 'rgba(236,72,153,0.08)', color: '#EC4899', Icon: Zap },
  'eyelash-brow':      { bg: 'rgba(132,204,22,0.08)', color: '#84CC16', Icon: ScanFace },
};

export const DEFAULT_CATEGORY_META: CategoryMetaItem = {
  bg: 'rgba(100,100,100,0.08)',
  color: '#71717A',
  Icon: Search,
};
