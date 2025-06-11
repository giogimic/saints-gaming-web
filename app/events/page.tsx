"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEditMode } from '@/app/contexts/EditModeContext';
import Image from "next/image";
import Link from "next/link";
import { EditableText } from "@/components/editable-text";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: "upcoming" | "ongoing" | "completed";
}

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { canEdit, isEditMode } = useEditMode();

  // Mock data - replace with actual data fetching
  const events: Event[] = [
    {
      id: "1",
      title: "ARK: Survival Ascended Launch Party",
      description: "Join us for the launch of our new ARK server!",
      date: "2024-03-15",
      time: "18:00 UTC",
      location: "Discord",
      image: "/saintsgaming-logo.png",
      status: "upcoming",
    },
    {
      id: "2",
      title: "Minecraft Build Competition",
      description: "Show off your building skills in our monthly competition!",
      date: "2024-03-20",
      time: "19:00 UTC",
      location: "Minecraft Server",
      image: "/saintsgaming-icon.png",
      status: "upcoming",
    },
  ];

  const handleSave = async (id: string, field: keyof Event, value: string) => {
    // Implement save functionality
    console.log(`Saving ${field} for event ${id}:`, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Events</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-6">
            {events.map((event) => (
              <Card key={event.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-gray-200">
                        {canEdit && isEditMode ? (
                          <EditableText
                            value={event.title}
                            onSave={async (value) => await handleSave(event.id, 'title', value)}
                          />
                        ) : (
                          event.title
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {canEdit && isEditMode ? (
                          <EditableText
                            value={event.description}
                            onSave={async (value) => await handleSave(event.id, 'description', value)}
                          />
                        ) : (
                          event.description
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          event.status === "upcoming"
                            ? "bg-green-500"
                            : event.status === "ongoing"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm text-gray-400">
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Date</p>
                        <p className="text-lg font-medium text-gray-200">
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={event.date}
                              onSave={async (value) => await handleSave(event.id, 'date', value)}
                            />
                          ) : (
                            event.date
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Time</p>
                        <p className="text-lg font-medium text-gray-200">
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={event.time}
                              onSave={async (value) => await handleSave(event.id, 'time', value)}
                            />
                          ) : (
                            event.time
                          )}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400">Location</p>
                        <p className="text-lg font-medium text-gray-200">
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={event.location}
                              onSave={async (value) => await handleSave(event.id, 'location', value)}
                            />
                          ) : (
                            event.location
                          )}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-gray-700 hover:bg-gray-600" asChild>
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calendar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-200">Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-700"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 