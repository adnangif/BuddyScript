import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    padding?: boolean;
    className?: string;
}

/**
 * Card Molecule
 * Generic content container with consistent styling
 */
export const Card: React.FC<CardProps> = ({
    children,
    padding = true,
    className = ''
}) => {
    const classes = [
        '_b_radious6',
        '_feed_inner_area',
        padding ? '_padd_t24 _padd_b24 _padd_r24 _padd_l24' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {children}
        </div>
    );
};
