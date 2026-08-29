import { useState } from "react";
import { useParams, Link, Navigate } from "@/lib/router-compat";
import { Heart, MessageCircle, Users, ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { TierGate } from "@/components/membership/TierGate";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSpace,
  useSpacePosts,
  useJoinSpace,
  useCreatePost,
  useReactToPost,
  useMyMemberSpaces,
} from "@/hooks/useCommunity";
import type { MembershipTier } from "@/hooks/useMembership";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

const SpaceView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: space, isLoading } = useSpace(slug);
  const { data: posts } = useSpacePosts(space?.id);
  const { data: memberSpaces } = useMyMemberSpaces();
  const joinSpace = useJoinSpace();
  const createPost = useCreatePost(space?.id ?? "");
  const react = useReactToPost();
  const [draft, setDraft] = useState("");

  if (!slug) return <Navigate to="/center" replace />;
  if (isLoading) {
    return (
      <main className="container-custom section-spacing">
        <Card className="h-32 animate-pulse bg-card/40" />
      </main>
    );
  }
  if (!space) {
    return (
      <main className="container-custom section-spacing text-center">
        <h1 className="text-h2 mb-3">Space not found</h1>
        <Button asChild>
          <Link to="/center">Back to Center</Link>
        </Button>
      </main>
    );
  }

  const isMember = memberSpaces?.has(space.id) ?? false;

  const handlePost = async () => {
    try {
      await createPost.mutateAsync(draft);
      setDraft("");
      toast({ title: "Posted", description: "Your post is live." });
    } catch (e: any) {
      toast({ title: "Could not post", description: e.message, variant: "destructive" });
    }
  };

  return (
    <TierGate tier={space.tier_required as MembershipTier}>
      <main className="min-h-screen">
        <SEOHead
          path={`/center/c/${space.slug}`}
          title={`${space.name} — Training Center | U.Psy`}
          description={space.description ?? undefined}
        />

        {/* Header */}
        <section className="border-b border-border/40 bg-card/40 backdrop-blur">
          <div className="container-custom py-8">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link to="/center">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                All spaces
              </Link>
            </Button>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{space.icon ?? "✦"}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {space.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {space.member_count} members
                  </span>
                </div>
                <h1 className="text-h2 font-bold">{space.name}</h1>
                <p className="text-muted-foreground mt-1">{space.description}</p>
              </div>
              {!isMember && user && (
                <Button onClick={() => joinSpace.mutate(space.id)} disabled={joinSpace.isPending}>
                  Join space
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Composer */}
        <section className="container-custom max-w-3xl py-8">
          {user && isMember && (
            <Card className="p-4 mb-6 bg-card/60 backdrop-blur">
              <Textarea
                placeholder="Share something with the space…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handlePost}
                  disabled={!draft.trim() || createPost.isPending}
                  size="sm"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Post
                </Button>
              </div>
            </Card>
          )}
          {!user && (
            <Card className="p-6 mb-6 bg-card/60 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to join the conversation.
              </p>
              <SocialAuthButtons className="mb-3 max-w-xs mx-auto" />
              <Button asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </Card>
          )}

          {/* Feed */}
          <div className="space-y-4">
            {posts?.length === 0 && (
              <Card className="p-12 text-center bg-card/40">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Be the first to post.</p>
              </Card>
            )}
            {posts?.map((post) => (
              <Card key={post.id} className="p-5 bg-card/60 backdrop-blur">
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
                {post.title && <h3 className="font-semibold mb-1.5">{post.title}</h3>}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
                  <button
                    onClick={() => react.mutate({ postId: post.id })}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    React
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.comment_count}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </TierGate>
  );
};

export default SpaceView;