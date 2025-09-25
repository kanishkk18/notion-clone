"use client";

import { useRouter } from "next/router";
import { useState } from "react";

import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";

export const CoverImageModal = () => {
  const router = useRouter();
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (file?: File) => {
    if (!file) return;

    setIsSubmitting(true);
    setFile(file);

    const res = await edgestore.publicFiles.upload({
      file,
      options: {
        replaceTargetUrl: coverImage.url,
      },
    });

    try {
      await fetch(`/api/documents/${router.query.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverImage: res.url }),
      });
    } catch (error) {
      console.error('Failed to update cover image:', error);
    }

    onClose();
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>

        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
};