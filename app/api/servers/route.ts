import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

interface ServerData {
  id: string;
  name: string;
  description: string;
  image: string;
  status: string;
  players: number;
  maxPlayers: number;
  version: string;
  ip: string;
  type: string;
  features: string;
  rules: string;
  modpack?: any;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ServerWithParsedData extends Omit<ServerData, 'features' | 'rules'> {
  features: string[];
  rules: string[];
}

export async function GET() {
  try {
    const servers = await prisma.server.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    // Parse JSON strings for features and rules
    const parsedServers: ServerWithParsedData[] = servers.map((server: ServerData) => ({
      ...server,
      features: JSON.parse(server.features),
      rules: JSON.parse(server.rules)
    }));

    return NextResponse.json(parsedServers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, ...data } = await request.json();
    
    // Stringify features and rules if they are arrays
    const updateData = {
      ...data,
      features: Array.isArray(data.features) ? JSON.stringify(data.features) : data.features,
      rules: Array.isArray(data.rules) ? JSON.stringify(data.rules) : data.rules
    };

    const server = await prisma.server.update({
      where: { id },
      data: updateData,
    });

    // Parse JSON strings before sending response
    const parsedServer: ServerWithParsedData = {
      ...server,
      features: JSON.parse(server.features),
      rules: JSON.parse(server.rules)
    };

    return NextResponse.json(parsedServer);
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json(
      { error: 'Failed to update server' },
      { status: 500 }
    );
  }
} 