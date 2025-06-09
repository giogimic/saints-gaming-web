import { useState } from 'react';
import { MessageSquare, Clock, User, ThumbsUp, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor } from '@/components/editor';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likes: number;
  replies: Comment[];
}

interface ThreadDetailProps {
  thread: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
    tags: string[];
  };
  comments: Comment[];
}

export function ThreadDetail({ thread, comments }: ThreadDetailProps) {
  const [activeTab, setActiveTab] = useState('discussion');
  const [replyContent, setReplyContent] = useState('');

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`ml-${depth * 4} mt-4`}>
      <Card className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={comment.author.avatarUrl} />
            <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.author.username}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {comment.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 prose prose-sm max-w-none">
              {comment.content}
            </div>
            <div className="mt-2">
              <Button variant="ghost" size="sm" onClick={() => setReplyContent('')}>
                Reply
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={thread.author.avatarUrl} />
            <AvatarFallback>{thread.author.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{thread.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{thread.author.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(thread.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
            <div className="mt-4 prose max-w-none">
              {thread.content}
            </div>
            {thread.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {thread.tags.map((tag) => (
                  <span key={tag} className="badge badge-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discussion">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion
          </TabsTrigger>
        </TabsList>
        <TabsContent value="discussion" className="mt-4">
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
              <Editor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply..."
              />
              <div className="flex justify-end mt-4">
                <Button>Post Reply</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 