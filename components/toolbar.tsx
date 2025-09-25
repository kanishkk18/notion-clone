"use client";

import { ImageIcon, Smile, X } from "lucide-react";
import React, { type ElementRef, useRef, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { useCoverImage } from "@/hooks/use-cover-image";

import { IconPicker } from "./icon-picker";

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

type ToolbarProps = {
  initialData: Document;
  preview?: boolean;
};

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);
  const router = useRouter();

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);

    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = async (value: string) => {
    setValue(value);
    
    try {
      await fetch(`/api/documents/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: value || "Untitled" }),
      });
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = async (icon: string) => {
    try {
      await fetch(`/api/documents/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icon }),
      });
    } catch (error) {
      console.error('Failed to update icon:', error);
    }
  };

  const onRemoveIcon = async () => {
    try {
      await fetch(`/api/documents/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icon: null }),
      });
    } catch (error) {
      console.error('Failed to remove icon:', error);
    }
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker onChange={onIconSelect} asChild>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}

        {!initialData.coverImage && !preview && (
          <Button
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
            onClick={coverImage.onOpen}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add cover
          </Button>
        )}
      </div>

      {isEditing && !preview ? (
        <TextareaAutoSize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          role="button"
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};