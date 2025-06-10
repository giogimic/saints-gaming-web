export interface BlockSettings {
  imageUrl?: string;
  alt?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'direct';
  buttonText?: string;
  buttonUrl?: string;
  columns?: number;
  authorName?: string;
  authorTitle?: string;
  price?: string;
  currency?: string;
  period?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: string;
  opacity?: number;
  animation?: string;
  customClass?: string;
} 