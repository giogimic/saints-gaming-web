import { BasePage, BasePageProps } from './base-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentRenderer } from '../content-renderer';
import { Users, Target, Heart } from 'lucide-react';

export function AboutPage({ page }: BasePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">{page.title}</h1>
            {page.description && (
              <p className="text-xl text-muted-foreground">{page.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Our Community</CardTitle>
                <CardDescription>
                  Building a vibrant and inclusive gaming community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe in creating a welcoming space where gamers can connect, share experiences, and grow together.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Our Mission</CardTitle>
                <CardDescription>
                  Providing the best gaming experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We strive to offer high-quality game servers, tournaments, and community events for all our members.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Our Values</CardTitle>
                <CardDescription>
                  Integrity, respect, and fun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We maintain a positive and respectful environment where everyone can enjoy gaming to the fullest.
                </p>
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