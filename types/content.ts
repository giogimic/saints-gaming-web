export interface BlockSettings {
  // Common settings
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  opacity?: number;
  animation?: "none" | "fade" | "slide" | "bounce";
  alignment?: "left" | "center" | "right";

  // Hero block settings
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;

  // Grid block settings
  columns?: number;
  gap?: string;

  // Card block settings
  cardStyle?: "default" | "bordered" | "shadowed";
  cardLayout?: "vertical" | "horizontal";

  // Image block settings
  altText?: string;
  caption?: string;
  imageSize?: "small" | "medium" | "large" | "full";
  imageFit?: "cover" | "contain" | "fill";

  // Button block settings
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "lg" | "default" | "icon";
  icon?: string;

  // Heading block settings
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  weight?: "normal" | "medium" | "semibold" | "bold";

  // Divider block settings
  style?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: string;

  // Spacer block settings
  height?: string;
  width?: string;
}

export interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings?: BlockSettings;
  title?: string;
  order: number;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  createdAt: Date;
  updatedAt: Date;
} 