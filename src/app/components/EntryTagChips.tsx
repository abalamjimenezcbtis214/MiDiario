import type { Tag } from "@/lib/supabase/database.types";
import { DEFAULT_TAG_COLOR } from "@/lib/diary/tagUtils";

type EntryTagChipsProps = {
  tags: Tag[];
  className?: string;
};

export function EntryTagChips({ tags, className = "" }: EntryTagChipsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {tags.map((tag) => {
        const color = tag.color ?? DEFAULT_TAG_COLOR;

        return (
          <span
            key={tag.id}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border-2"
            style={{
              borderColor: color,
              backgroundColor: `${color}20`,
              color: "#4a4a4a",
            }}
          >
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}
