import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * Button Atom
 * Basic button component with multiple variants
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    loading = false,
    icon,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = '_btn1';

    // Map variants to existing CSS classes from the design system
    const variantClasses: Record<ButtonVariant, string> = {
        primary: '_btn1',
        secondary: '_btn2',
        danger: '_btn_danger',
        outline: '_btn_outline',
        ghost: '_btn_ghost'
    };

    const classes = [
        variantClasses[variant],
        fullWidth ? 'w-100' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type="button"
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>{children}</span>
                </span>
            ) : (
                <>
                    {icon && <span className="me-2">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};
