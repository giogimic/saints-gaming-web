interface Post {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likes: number;
  comments: Comment[];
}

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
}

interface ThreadDetailProps {
  thread: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    isPinned: boolean;
    isLocked: boolean;
    author: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
    tags: string[];
  };
  posts: Post[];
}

export function ThreadDetail({ thread, posts }: ThreadDetailProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('discussion');
  const [postContent, setPostContent] = useState('');

  const canManageThreads = session?.user && hasPermission(session.user.role, 'manage:content');
  const canPost = !thread.isLocked || canManageThreads;

  const handlePinThread = async () => {
    try {
      const response = await fetch(`/api/forum/threads/${thread.id}/pin`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to pin thread');
      }

      const updatedThread = await response.json();
      toast.success(updatedThread.isPinned ? 'Thread pinned' : 'Thread unpinned');
    } catch (error) {
      console.error('Error pinning thread:', error);
      toast.error('Failed to pin thread');
    }
  };

  const handleLockThread = async () => {
    try {
      const response = await fetch(`/api/forum/threads/${thread.id}/lock`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to lock thread');
      }

      const updatedThread = await response.json();
      toast.success(updatedThread.isLocked ? 'Thread locked' : 'Thread unlocked');
    } catch (error) {
      console.error('Error locking thread:', error);
      toast.error('Failed to lock thread');
    }
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="mt-4">
      <Card className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{post.author.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.username}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 prose prose-sm max-w-none">
              {post.content}
            </div>
            <div className="mt-2">
              <Button variant="ghost" size="sm" onClick={() => setPostContent('')}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {post.comments?.map((comment) => (
        <div key={comment.id} className="ml-8 mt-2">
          <Card className="p-3">
            <div className="flex gap-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.author.avatarUrl} />
                <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.author.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  {comment.content}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{thread.title}</h1>
              {thread.isPinned && (
                <Badge variant="secondary">Pinned</Badge>
              )}
              {thread.isLocked && (
                <Badge variant="destructive">Locked</Badge>
              )}
            </div>
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
            {canManageThreads && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePinThread}
                >
                  <Pin className="w-4 h-4 mr-2" />
                  {thread.isPinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLockThread}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {thread.isLocked ? 'Unlock' : 'Lock'}
                </Button>
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
            {posts.map((post) => renderPost(post))}
            
            {canPost ? (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
                <TiptapEditor
                  content={postContent}
                  onChange={setPostContent}
                />
                <div className="flex justify-end mt-4">
                  <Button>Post Reply</Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="text-center text-muted-foreground">
                  <Lock className="w-6 h-6 mx-auto mb-2" />
                  <p>This thread is locked. Only moderators can post replies.</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 