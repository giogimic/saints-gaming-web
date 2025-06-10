import { BasePage, BasePageProps } from './base-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentRenderer } from '../content-renderer';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ContactPage({ page }: BasePageProps) {
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

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Message subject" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle>Email</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    support@saintsgaming.com
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Discord</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join our Discord server for real-time support and community interaction
                  </p>
                  <Button asChild className="mt-4">
                    <a href="discord://discord.com/channels/your-server-id" target="_blank" rel="noopener noreferrer">
                      Join Discord
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our servers are hosted in multiple locations worldwide for optimal performance
                  </p>
                </CardContent>
              </Card>
            </div>
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