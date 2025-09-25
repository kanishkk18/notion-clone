"use client";

import { Search, Trash, Undo } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/spinner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Input } from "@/components/ui/input";

type Document = {
  id: string
  title: string
  content?: string
  coverImage?: string
  icon?: string
  isArchived: boolean
  isPublished: boolean
  userId: string
  parentId?: string
  createdAt: string
  updatedAt: string
}

export const TrashBox = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredDocuments = documents?.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase())
  );

  const onClick = (documentId: string) =>
    router.push(`/documents/${documentId}`);

  const onRestore = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    documentId: string
  ) => {
    event.stopPropagation();

    try {
      const response = await fetch(`/api/documents/${documentId}/restore`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to restore document');
      }

      toast.success('Note restored.');
      // Refresh the trash list
      fetchTrashDocuments();
    } catch (error) {
      toast.error('Failed to restore note.');
    }
  };

  const onRemove = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Note deleted.');
      
      if (router.query.id === documentId) {
        router.push('/documents');
      }
      
      // Refresh the trash list
      fetchTrashDocuments();
    } catch (error) {
      toast.error('Failed to delete note.');
    }
  };

  const fetchTrashDocuments = async () => {
    try {
      const response = await fetch('/api/documents/trash');
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to fetch trash documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashDocuments();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>

      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>
        {filteredDocuments?.map((document) => (
          <button
            key={document.id}
            onClick={() => onClick(document.id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
          >
            <span className="truncate pl-2">{document.title}</span>
            <div className="flex items-center">
              <button
                onClick={(e) => onRestore(e, document.id)}
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </button>

              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <button className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600">
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </button>
              </ConfirmModal>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};