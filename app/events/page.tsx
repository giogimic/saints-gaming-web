"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Gamepad2, Users, Clock, Trophy, AlertCircle, Edit2, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditMode } from "@/components/admin-widget";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  game: string;
  type: 'Tournament' | 'Contest' | 'Casual' | 'Other';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  registrationDeadline: string;
  rules?: string[];
  discordChannel?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { data: session } = useSession();
  const router = useRouter();
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<Partial<Event>>({});
  const isEditMode = useEditMode();

  const canEditEvents = session?.user?.role === UserRole.ADMIN && isEditMode;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/community/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    switch (activeTab) {
      case "upcoming":
        return event.status === "Upcoming";
      case "ongoing":
        return event.status === "Ongoing";
      case "completed":
        return event.status === "Completed";
      default:
        return true;
    }
  });

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setForm(event);
    setShowDialog(true);
  };

  const handleNew = () => {
    setEditEvent(null);
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      participants: 0,
      maxParticipants: 0,
      prize: "",
      game: "",
      type: "Tournament",
      status: "Upcoming",
      registrationDeadline: "",
      rules: [],
      discordChannel: "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/community/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents(events.filter(e => e.id !== id));
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editEvent ? "PATCH" : "POST";
      const url = editEvent ? `/api/community/events/${editEvent.id}` : "/api/community/events";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save event");
      const updated = await res.json();
      if (editEvent) {
        setEvents(events.map(e => (e.id === updated.id ? updated : e)));
        toast({ title: "Event updated" });
      } else {
        setEvents([updated, ...events]);
        toast({ title: "Event created" });
      }
      setShowDialog(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save event", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events & Tournaments</h1>
        {canEditEvents && (
          <div className="flex gap-2">
            <Button onClick={handleNew} variant="default">
              <Plus className="w-4 h-4 mr-1" /> New Event
            </Button>
            <Button onClick={() => router.push("/admin/events")}>Manage Events</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-2">{event.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">{event.prize}</span>
                    </div>
                  </div>
                  {canEditEvents && (
                    <div className="flex gap-2 mt-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(event)}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(event.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gamepad2 className="h-4 w-4" />
                        <span>{event.game}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.participants}/{event.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                    {event.registrationDeadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          Registration closes{" "}
                          {format(new Date(event.registrationDeadline), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ongoing" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {event.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">{event.prize}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gamepad2 className="h-4 w-4" />
                        <span>{event.game}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.participants}/{event.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {event.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">{event.prize}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gamepad2 className="h-4 w-4" />
                        <span>{event.game}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.participants}/{event.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input name="title" value={form.title || ""} onChange={handleFormChange} placeholder="Title" required />
            <Textarea name="description" value={form.description || ""} onChange={handleFormChange} placeholder="Description" required />
            <Input name="date" type="date" value={form.date || ""} onChange={handleFormChange} required />
            <Input name="time" type="time" value={form.time || ""} onChange={handleFormChange} required />
            <Input name="participants" type="number" value={form.participants || 0} onChange={handleFormChange} placeholder="Participants" required />
            <Input name="maxParticipants" type="number" value={form.maxParticipants || 0} onChange={handleFormChange} placeholder="Max Participants" required />
            <Input name="prize" value={form.prize || ""} onChange={handleFormChange} placeholder="Prize" />
            <Input name="game" value={form.game || ""} onChange={handleFormChange} placeholder="Game" required />
            <Input name="type" value={form.type || "Tournament"} onChange={handleFormChange} placeholder="Type" required />
            <Input name="status" value={form.status || "Upcoming"} onChange={handleFormChange} placeholder="Status" required />
            <Input name="registrationDeadline" type="date" value={form.registrationDeadline || ""} onChange={handleFormChange} placeholder="Registration Deadline" />
            <Input name="discordChannel" value={form.discordChannel || ""} onChange={handleFormChange} placeholder="Discord Channel" />
            <Textarea name="rules" value={Array.isArray(form.rules) ? form.rules.join("\n") : form.rules || ""} onChange={e => setForm(prev => ({ ...prev, rules: e.target.value.split("\n") }))} placeholder="Rules (one per line)" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button type="submit" variant="default">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 