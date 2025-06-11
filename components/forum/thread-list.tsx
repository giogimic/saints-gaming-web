"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThreadForm } from "./thread-form";
import { SelectItem } from "@/components/ui/select";
import { ThreadTags } from "@/components/thread-tags";

interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  posts: number;
  views: number;
  tags: Tag[];
}

interface ThreadListProps {
  categoryId: string;
}

export function ThreadList({ categoryId }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`/api/forum/threads?categoryId=${categoryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch threads");
      }
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/forum/tags');
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      setAllTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchThreads();
    fetchTags();
  }, [categoryId]);

  const handleTagsChange = (threadId: string, newTags: Tag[]) => {
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.id === threadId ? { ...thread, tags: newTags } : thread
      )
    );
  };

  if (isLoading) {
    return <div>Loading threads...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Threads</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Thread"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreadForm
              categoryId={categoryId}
              onSuccess={() => {
                setShowForm(false);
                fetchThreads();
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {threads.map((thread) => (
          <Card key={thread.id}>
            <CardContent className="p-4">
              <Link href={`/forum/thread/${thread.id}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{thread.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted by {thread.author.name} on{" "}
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </p>
                    <ThreadTags
                      threadId={thread.id}
                      tags={thread.tags}
                      allTags={allTags}
                      onTagsChange={(newTags) => handleTagsChange(thread.id, newTags)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {thread.posts} posts
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 