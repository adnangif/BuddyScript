import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';

export interface SuggestedPersonCardProps {
    id: string;
    name: string;
    subtitle: string;
    avatarSrc?: string;
    profileHref?: string;
    onConnect?: () => void;
    connectLabel?: string;
    className?: string;
}

/**
 * SuggestedPersonCard Molecule
 * Card component for displaying suggested people with connect action
 */
export const SuggestedPersonCard: React.FC<SuggestedPersonCardProps> = ({
    name,
    subtitle,
    avatarSrc,
    profileHref = '#',
    onConnect,
    connectLabel = 'Connect',
    className = ''
}) => {
    return (
        <div className={`_left_inner_area_suggest_info ${className}`.trim()}>
            <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                    <a href={profileHref}>
                        <Avatar
                            src={avatarSrc}
                            alt={name}
                            fallbackText={name.charAt(0)}
                            size="md"
                            className="_info_img"
                        />
                    </a>
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                    <a href={profileHref}>
                        <h4 className="_left_inner_area_suggest_info_title">
                            {name}
                        </h4>
                    </a>
                    <p className="_left_inner_area_suggest_info_para">
                        {subtitle}
                    </p>
                </div>
            </div>
            <div className="_left_inner_area_suggest_info_link">
                <a
                    href="#0"
                    className="_info_link"
                    onClick={(e) => {
                        if (onConnect) {
                            e.preventDefault();
                            onConnect();
                        }
                    }}
                >
                    {connectLabel}
                </a>
            </div>
        </div>
    );
};
