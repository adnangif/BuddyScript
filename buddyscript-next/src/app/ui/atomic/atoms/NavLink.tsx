import React, { ReactNode } from 'react';

export interface NavLinkProps {
    href: string;
    icon: ReactNode;
    badge?: number | string;
    active?: boolean;
    ariaLabel?: string;
    className?: string;
}

/**
 * NavLink Atom
 * Navigation link with icon and optional badge
 */
export const NavLink: React.FC<NavLinkProps> = ({
    href,
    icon,
    badge,
    active = false,
    ariaLabel,
    className = ''
}) => {
    const linkClass = active 
        ? `_header_nav_link_active _header_nav_link ${className}`.trim()
        : `_header_nav_link ${className}`.trim();

    return (
        <a
            className={linkClass}
            href={href}
            aria-current={active ? 'page' : undefined}
            aria-label={ariaLabel}
        >
            {icon}
            {badge && <span className="_counting">{badge}</span>}
        </a>
    );
};
