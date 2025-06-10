import { BasePage, BasePageProps } from './base-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Gamepad2, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ContentRenderer } from '../content-renderer';

export function HomePage({ page }: BasePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Welcome to Saints Gaming
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your ultimate destination for gaming communities, tournaments, and server hosting
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/servers">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Join Our Servers
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/discord">
                  <Users className="mr-2 h-5 w-5" />
                  Join Discord
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Gamepad2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Game Servers</CardTitle>
                <CardDescription>
                  Access our high-performance game servers with active communities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/servers">
                    View Servers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Join our vibrant community of gamers and make new friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/community">
                    Join Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Forums</CardTitle>
                <CardDescription>
                  Discuss games, share strategies, and connect with other players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/forums">
                    Browse Forums
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CMS Content */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {page.blocks.map((block) => (
              <div key={block.id} className="prose dark:prose-invert max-w-none">
                <ContentRenderer block={block} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 