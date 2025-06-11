import { z } from "zod";

// Base content block schema
const baseContentBlockSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(5000, "Content is too long"),
  type: z.enum(["text", "textarea", "rich-text"]).default("text"),
  settings: z.object({
    isPublic: z.boolean().default(true),
    allowComments: z.boolean().default(true),
    lastEditedBy: z.string().optional(),
    lastEditedAt: z.string().datetime().optional(),
  }).optional(),
});

// Game schema
const gameSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title is too long"),
  description: z.string().min(1, "Description cannot be empty").max(500, "Description is too long"),
  imageUrl: z.string().url().optional(),
  status: z.enum(["active", "maintenance", "offline"]).default("active"),
  version: z.string().optional(),
  players: z.number().min(0).optional(),
  maxPlayers: z.number().min(0).optional(),
});

// Page content schema
export const pageContentSchema = z.object({
  title: baseContentBlockSchema,
  subtitle: baseContentBlockSchema.optional(),
  hero: baseContentBlockSchema.optional(),
  mainContent: baseContentBlockSchema.optional(),
  games: z.object({
    content: z.array(gameSchema),
  }).optional(),
  features: z.object({
    content: z.array(z.object({
      title: z.string().min(1, "Feature title cannot be empty").max(100, "Feature title is too long"),
      description: z.string().min(1, "Feature description cannot be empty").max(500, "Feature description is too long"),
      icon: z.string().optional(),
    })),
  }).optional(),
  metadata: z.object({
    description: z.string().max(160, "Meta description is too long").optional(),
    keywords: z.array(z.string()).optional(),
    lastModified: z.string().datetime().optional(),
    version: z.string().optional(),
  }).optional(),
});

// Block content schema for individual content blocks
export const blockContentSchema = z.object({
  type: z.enum(["text", "textarea", "rich-text", "image", "video", "embed"]),
  content: z.string().min(1, "Content cannot be empty"),
  settings: z.object({
    isPublic: z.boolean().default(true),
    allowComments: z.boolean().default(true),
    lastEditedBy: z.string().optional(),
    lastEditedAt: z.string().datetime().optional(),
  }).optional(),
  position: z.number().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

// Export types
export type PageContent = z.infer<typeof pageContentSchema>;
export type BlockContent = z.infer<typeof blockContentSchema>;
export type Game = z.infer<typeof gameSchema>; 
export type BlockContent = z.infer<typeof blockContentSchema>; 