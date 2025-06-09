import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Gamepad2, Users, Calendar, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to SaintsGaming
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join our vibrant gaming community. Connect with fellow gamers, participate in events,
              and stay updated with the latest gaming news.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">Join Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Gamepad2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gaming Events</CardTitle>
              <CardDescription>
                Join our regular gaming tournaments and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Participate in competitive tournaments, casual gaming sessions, and special events.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="p-0">
                <Link href="/events">
                  View Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Connect with fellow gamers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join our active community forums and Discord server to connect with other gamers.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="p-0">
                <Link href="/community">
                  Join Community <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Forums</CardTitle>
              <CardDescription>
                Engage in gaming discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Share your thoughts, ask questions, and discuss your favorite games.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="p-0">
                <Link href="/forum">
                  Visit Forums <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest News</h2>
            <Button variant="outline" asChild>
              <Link href="/news">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News cards will be dynamically populated */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tournament</CardTitle>
                <CardDescription>March 15, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join our upcoming CS:GO tournament with a $1000 prize pool.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="p-0">
                  <Link href="/news/tournament">Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Become part of our growing gaming community. Create an account today and start your journey with SaintsGaming.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}