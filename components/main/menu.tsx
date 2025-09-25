"use client";

import { useSession } from 'next-auth/react'
import { MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

type MenuProps = {
  documentId: string;
  isArchived: boolean;
};

export const Menu = ({ documentId, isArchived }: MenuProps) => {
  const router = useRouter();
  const { data: session } = useSession()

  const onArchive = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/archive`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to archive document');
      }

      toast.success('Note moved to trash.');
      router.push('/documents');
    } catch (error) {
      toast.error('Failed to archive note.');
    }
  };

  const onRemove = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Note deleted.');
      router.push('/documents');
    } catch (error) {
      toast.error('Failed to delete note.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={isArchived ? onRemove : onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          {isArchived ? "Delete forever" : "Move to trash"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {session?.user?.name}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};