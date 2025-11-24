import React from 'react';

export interface AvatarProps {
    src?: string;
    alt: string;
    fallbackText?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Avatar Atom
 * User profile image with fallback to initials
 */
export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    fallbackText,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: '_avatar_sm',
        md: '_avatar_md',
        lg: '_avatar_lg'
    };

    const baseClass = `_avatar ${sizeClasses[size]} ${className}`.trim();

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={baseClass}
            />
        );
    }

    // Fallback to initials or first character
    const initials = fallbackText || alt.charAt(0).toUpperCase();

    return (
        <div className={`${baseClass} _avatar_fallback`}>
            {initials}
        </div>
    );
};
