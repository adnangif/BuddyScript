import React from 'react';
import { Avatar } from '../atoms/Avatar';

export interface UserInfoProps {
    name: string;
    subtitle?: string;
    avatarSrc?: string;
    avatarSize?: 'sm' | 'md' | 'lg';
    href?: string;
    className?: string;
}

/**
 * UserInfo Molecule
 * Displays user avatar with name and optional subtitle
 */
export const UserInfo: React.FC<UserInfoProps> = ({
    name,
    subtitle,
    avatarSrc,
    avatarSize = 'md',
    href,
    className = ''
}) => {
    const content = (
        <>
            <div className="_user_info_avatar">
                <Avatar
                    src={avatarSrc}
                    alt={name}
                    fallbackText={name.charAt(0)}
                    size={avatarSize}
                />
            </div>
            <div className="_user_info_text">
                <h4 className="_user_info_name">
                    {name}
                </h4>
                {subtitle && (
                    <p className="_user_info_subtitle">
                        {subtitle}
                    </p>
                )}
            </div>
        </>
    );

    if (href) {
        return (
            <a href={href} className={`_user_info ${className}`.trim()}>
                {content}
            </a>
        );
    }

    return (
        <div className={`_user_info ${className}`.trim()}>
            {content}
        </div>
    );
};
