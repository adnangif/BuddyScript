import React from 'react';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

/**
 * Badge Atom
 * Small label/indicator for status, counts, or notifications
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variantClasses = {
        default: '_badge_default',
        success: '_badge_success',
        warning: '_badge_warning',
        danger: '_badge_danger',
        info: '_badge_info'
    };

    const classes = [
        '_badge',
        variantClasses[variant],
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {children}
        </span>
    );
};
