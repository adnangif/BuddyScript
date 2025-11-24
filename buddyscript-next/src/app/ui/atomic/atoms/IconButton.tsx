import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label: string; // For accessibility
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

/**
 * IconButton Atom
 * Button with only an icon, includes accessibility label
 */
export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    label,
    variant = 'ghost',
    className = '',
    ...props
}) => {
    const variantClasses = {
        primary: '_icon_btn_primary',
        secondary: '_icon_btn_secondary',
        danger: '_icon_btn_danger',
        ghost: '_icon_btn_ghost'
    };

    const classes = [
        '_icon_btn',
        variantClasses[variant],
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type="button"
            className={classes}
            aria-label={label}
            title={label}
            {...props}
        >
            {icon}
        </button>
    );
};
