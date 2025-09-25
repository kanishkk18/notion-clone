"use client";

import { useRouter } from "next/router";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";

type BannerProps = {
  documentId: string;
};

export const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

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

  const onRestore = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/restore`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to restore document');
      }

      toast.success('Note restored.');
    } catch (error) {
      toast.error('Failed to restore note.');
    }
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>

      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};