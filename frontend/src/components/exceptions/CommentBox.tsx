import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { ExceptionComment } from '@/services/exceptionsService';
import { formatDistanceToNow } from 'date-fns';

interface CommentBoxProps {
  comments: ExceptionComment[];
  onAddComment: (content: string, isInternal: boolean) => Promise<void>;
  loading?: boolean;
  showInternalToggle?: boolean;
  className?: string;
}

/**
 * CommentBox Component
 * 
 * Displays comments thread with ability to add new comments.
 * Supports internal/external comment visibility.
 * 
 * @example
 * ```tsx
 * <CommentBox
 *   comments={comments}
 *   onAddComment={handleAddComment}
 *   showInternalToggle
 * />
 * ```
 */
export const CommentBox: React.FC<CommentBoxProps> = ({
  comments,
  onAddComment,
  loading = false,
  showInternalToggle = true,
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment, isInternal);
      setNewComment('');
      setIsInternal(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* New Comment Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            
            <div className="flex items-center justify-between">
              {showInternalToggle && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="internal-comment"
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    disabled={submitting}
                  />
                  <Label 
                    htmlFor="internal-comment" 
                    className="text-sm font-normal flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="h-3 w-3" />
                    Internal note (visible to team only)
                  </Label>
                </div>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`flex gap-3 p-3 rounded-lg ${
                    comment.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-muted'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.userName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
