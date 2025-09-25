"use client";

import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { cn } from "@/lib/utils";

type CoverProps = {
  url?: string;
  preview?: boolean;
};

export const Cover = ({ url, preview }: CoverProps) => {
  const { edgestore } = useEdgeStore();
  const router = useRouter();
  const coverImage = useCoverImage();

  const onRemove = async () => {
    if (url) {
      await edgestore.publicFiles.delete({
        url,
      });
    }

    try {
      await fetch(`/api/documents/${router.query.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverImage: null }),
      });
    } catch (error) {
      console.error('Failed to remove cover image:', error);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted"
      )}
    >
      {!!url && (
        <Image src={url} fill alt="Cover image" className="object-cover" />
      )}

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>

          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};