"use client";

import { FileIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Item } from "./item";
import { cn } from "@/lib/utils";

type Document = {
  id: string
  title: string
  icon?: string
}

type DocumentListProps = {
  parentDocumentId?: string;
  level?: number;
};

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const onRedirect = (documentId: string) =>
    router.push(`/documents/${documentId}`);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const url = parentDocumentId 
          ? `/api/documents?parentId=${parentDocumentId}`
          : '/api/documents';
        
        const response = await fetch(url);
        if (response.ok) {
          const docs = await response.json();
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [parentDocumentId]);

  if (loading) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{
          paddingLeft: level ? `${level * 12 + 25}px` : undefined,
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside.
      </p>
      {documents.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            onClick={() => onRedirect(document.id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={router.query.id === document.id}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
          />

          {expanded[document.id] && (
            <DocumentList parentDocumentId={document.id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};