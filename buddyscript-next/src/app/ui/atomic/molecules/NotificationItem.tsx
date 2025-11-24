import React from 'react';

export interface NotificationItemProps {
    id: string;
    name: string;
    detail: string;
    avatar: string;
    time: string;
    onClick?: () => void;
    className?: string;
}

/**
 * NotificationItem Molecule
 * Single notification card with avatar, message, and timestamp
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
    name,
    detail,
    avatar,
    time,
    onClick,
    className = ''
}) => {
    return (
        <div 
            className={`_notification_box ${className}`.trim()}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="_notification_image">
                <img
                    src={avatar}
                    alt={name}
                    className="_notify_img"
                />
            </div>
            <div className="_notification_txt">
                <p className="_notification_para">
                    <span className="_notify_txt_link">{name}</span>{' '}
                    {detail}
                </p>
                <div className="_nitification_time">
                    <span>{time}</span>
                </div>
            </div>
        </div>
    );
};
