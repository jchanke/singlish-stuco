import { z } from "astro:content";
import { lessonSchema } from "./content.config";

export type LessonFrontmatter = z.infer<typeof lessonSchema>;
