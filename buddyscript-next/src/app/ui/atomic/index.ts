/**
 * Atomic Design System - Central Export
 * Import all components from this single location
 * 
 * Usage:
 *   import { Button, FormField, AuthLayout } from '@/app/ui/atomic';
 */

// Atoms
export { Button } from './atoms/Button';
export type { ButtonProps, ButtonVariant } from './atoms/Button';

export { IconButton } from './atoms/IconButton';
export type { IconButtonProps } from './atoms/IconButton';

export { Label } from './atoms/Label';
export type { LabelProps } from './atoms/Label';

export { Input } from './atoms/Input';
export type { InputProps } from './atoms/Input';

export { ErrorMessage } from './atoms/ErrorMessage';
export type { ErrorMessageProps } from './atoms/ErrorMessage';

export { Textarea } from './atoms/Textarea';
export type { TextareaProps } from './atoms/Textarea';

export { Avatar } from './atoms/Avatar';
export type { AvatarProps } from './atoms/Avatar';

export { Badge } from './atoms/Badge';
export type { BadgeProps } from './atoms/Badge';

// Molecules
export { FormField } from './molecules/FormField';
export type { FormFieldProps } from './molecules/FormField';

export { Card } from './molecules/Card';
export type { CardProps } from './molecules/Card';

export { UserInfo } from './molecules/UserInfo';
export type { UserInfoProps } from './molecules/UserInfo';

export { PostActions } from './molecules/PostActions';
export type { PostActionsProps } from './molecules/PostActions';

export { CommentForm } from './molecules/CommentForm';
export type { CommentFormProps } from './molecules/CommentForm';

export { SuggestedPersonCard } from './molecules/SuggestedPersonCard';
export type { SuggestedPersonCardProps } from './molecules/SuggestedPersonCard';

export { FriendActivityCard } from './molecules/FriendActivityCard';
export type { FriendActivityCardProps } from './molecules/FriendActivityCard';

// Organisms
export { AuthLayout } from './organisms/AuthLayout';
export type { AuthLayoutProps } from './organisms/AuthLayout';
export { PostCard } from './organisms/PostCard';
export type { PostCardProps } from './organisms/PostCard';
export { SidebarSection } from './organisms/SidebarSection';
export type { SidebarSectionProps } from './organisms/SidebarSection';
