import React, { ChangeEvent, FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';

export interface CommentFormProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isSubmitting?: boolean;
    placeholder?: string;
    maxLength?: number;
}

/**
 * CommentForm Molecule
 * Form for posting comments with textarea and submit button
 */
export const CommentForm: React.FC<CommentFormProps> = ({
    value,
    onChange,
    onSubmit,
    isSubmitting = false,
    placeholder = 'Write a comment...',
    maxLength = 1000
}) => {
    return (
        <form onSubmit={onSubmit} style={{ marginBottom: '16px' }}>
            <Textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={isSubmitting}
                style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical',
                }}
            />
            <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{
                    marginTop: '8px',
                    padding: '8px 20px',
                    fontSize: '14px',
                }}
            >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
        </form>
    );
};
