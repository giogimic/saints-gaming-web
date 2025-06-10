"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useEditMode } from "@/components/admin-widget";
import { toast } from "@/components/ui/use-toast";

export default function HomePage() {
  const isEditMode = useEditMode();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch('/api/pages?slug=home');
        if (!response.ok) {
          throw new Error(`Failed to fetch page content: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setContent(data.content);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load page content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageContent();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Home page content not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          {content.hero?.title}
        </h1>
        <p className="text-xl md:text-2xl mb-6">
          {content.hero?.subtitle}
        </p>
        <button className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          {content.hero?.button}
        </button>
      </section>
      {/* Welcome Message */}
      <section className="container mx-auto py-12 text-center">
        <p className="text-lg md:text-xl">
          {content.welcome?.content}
        </p>
      </section>
    </div>
  );
}