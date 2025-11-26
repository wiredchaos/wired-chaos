import { z } from "zod";

export const PlatformItem = z.object({
  platform: z.string().min(1),
  accountId: z.string().min(1),
  textOverride: z.string().min(1).optional(),
  altText: z.string().max(1000).optional(),
  media: z.array(z.string().url()).optional(),
});

export const PublishBody = z.object({
  profileId: z.string().min(1),
  text: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
  utm: z.record(z.string()).optional(),
  media: z.array(z.string().url()).optional(),
  platforms: z.array(PlatformItem).min(1),
});

export type TPublishBody = z.infer<typeof PublishBody>;
