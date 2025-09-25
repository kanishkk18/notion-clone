"use client";

import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

type TitleProps = {
  initialData: Document;
};

export const Title = ({ initialData }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData.title || "Untitled");

  const enableInput = () => {
    if (initialData.isArchived) return;

    setTitle(initialData.title);
    setIsEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value || "Untitled";
    setTitle(newTitle);

    try {
      await fetch(`/api/documents/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") disableInput();
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{initialData.title}</span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-9 w-16 rounded-md" />;
};