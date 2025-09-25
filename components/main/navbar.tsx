"use client";

import { MenuIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { Title } from "./title";

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

type NavbarProps = {
  isCollapsed: boolean;
  onResetWidth: () => void;
};

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!router.query.id) return;

      try {
        const response = await fetch(`/api/documents/${router.query.id}`);
        if (response.ok) {
          const doc = await response.json();
          setDocument(doc);
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [router.query.id]);

  if (loading) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />

        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (!document) return null;

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <button onClick={onResetWidth}>
            <MenuIcon className="h-6 w-6 text-muted-foreground" />
          </button>
        )}

        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />

          <div className="flex items-center gap-x-2">
            {!document.isArchived && <Publish initialData={document} />}
            <Menu documentId={document.id} isArchived={document.isArchived} />
          </div>
        </div>
      </nav>

      {document.isArchived && <Banner documentId={document.id} />}
    </>
  );
};