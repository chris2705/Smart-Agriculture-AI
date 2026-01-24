import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedTree = ({ position = 'left', delay = 0, season = 'spring' }) => {
    const isLeft = position === 'left';

    // Color schemes based on season
    const seasonColors = {
        spring: {
            leaves: ['#22c55e', '#4ade80', '#86efac'],
            flowers: ['#fda4af', '#fecdd3', '#fef3c7', '#ffffff']
        },
        summer: {
            leaves: ['#10b981', '#22c55e', '#4ade80', '#059669'],
            flowers: []
        }
    };

    const colors = seasonColors[season] || seasonColors.spring;

    // Generate random leaves with varied colors
    const leaves = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 120 - 60,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        delay: delay + Math.random() * 2,
        color: colors.leaves[Math.floor(Math.random() * colors.leaves.length)],
        pulseDelay: Math.random() * 3,
    }));

    // Generate blooming flowers (only for spring)
    const flowers = season === 'spring' ? Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 90 - 45,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.5,
        delay: delay + 0.5 + Math.random() * 2,
        color: colors.flowers[Math.floor(Math.random() * colors.flowers.length)],
    })) : [];

    // Falling petals
    const fallingPetals = season === 'spring' ? Array.from({ length: 10 }, (_, i) => ({
        id: i,
        startX: Math.random() * 100,
        startY: -20 - Math.random() * 50,
        endX: Math.random() * 100,
        endY: 120 + Math.random() * 20,
        rotation: Math.random() * 720,
        delay: delay + Math.random() * 4,
        duration: 10 + Math.random() * 5,
        color: colors.flowers[Math.floor(Math.random() * colors.flowers.length)],
    })) : [];

    // Floating falling leaves
    const floatingLeaves = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        startX: Math.random() * 100,
        startY: -20 - Math.random() * 50,
        endX: Math.random() * 100,
        endY: 120 + Math.random() * 20,
        rotation: Math.random() * 720,
        delay: delay + Math.random() * 3,
        duration: 8 + Math.random() * 4,
        color: colors.leaves[Math.floor(Math.random() * colors.leaves.length)],
    }));

    return (
        <div className={`fixed ${isLeft ? 'left-0' : 'right-0'} bottom-0 pointer-events-none z-0 opacity-40`}>
            <svg
                width="300"
                height="500"
                viewBox="0 0 300 500"
                className={isLeft ? '' : 'scale-x-[-1]'}
            >
                {/* Tree trunk with sway animation */}
                <motion.path
                    d="M 150 500 Q 145 400, 140 300 Q 138 200, 135 100 Q 133 50, 130 20"
                    stroke="#4a3728"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: 1,
                        opacity: 1,
                    }}
                    transition={{ duration: 2, delay, ease: "easeOut" }}
                />

                {/* Main branches with gentle sway */}
                <motion.g
                    animate={{
                        rotate: [0, 1, 0, -1, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: delay + 2,
                    }}
                    style={{ originX: '135px', originY: '150px' }}
                >
                    <motion.path
                        d="M 135 100 Q 100 80, 70 70"
                        stroke="#5a4738"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeOut" }}
                    />
                    <motion.path
                        d="M 135 150 Q 180 130, 210 120"
                        stroke="#5a4738"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: delay + 0.6, ease: "easeOut" }}
                    />
                    <motion.path
                        d="M 138 200 Q 90 180, 60 170"
                        stroke="#5a4738"
                        strokeWidth="7"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: delay + 0.7, ease: "easeOut" }}
                    />
                    <motion.path
                        d="M 138 250 Q 190 230, 220 220"
                        stroke="#5a4738"
                        strokeWidth="7"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: delay + 0.8, ease: "easeOut" }}
                    />
                </motion.g>

                {/* Blooming flowers */}
                {flowers.map((flower) => (
                    <motion.g
                        key={`flower-${flower.id}`}
                        initial={{ scale: 0, opacity: 0, rotate: 0 }}
                        animate={{
                            scale: [0, flower.scale * 1.2, flower.scale],
                            opacity: [0, 1, 0.9],
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: 2,
                            delay: flower.delay,
                            ease: "easeOut",
                        }}
                    >
                        {/* Flower petals */}
                        {[0, 72, 144, 216, 288].map((angle, i) => (
                            <motion.ellipse
                                key={i}
                                cx={150 + flower.x + Math.cos((angle * Math.PI) / 180) * 8}
                                cy={150 + flower.y + Math.sin((angle * Math.PI) / 180) * 8}
                                rx="6"
                                ry="10"
                                fill={flower.color}
                                opacity="0.85"
                                transform={`rotate(${angle} ${150 + flower.x} ${150 + flower.y})`}
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    delay: flower.delay + 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            />
                        ))}
                        {/* Flower center */}
                        <circle
                            cx={150 + flower.x}
                            cy={150 + flower.y}
                            r="4"
                            fill="#fbbf24"
                            opacity="0.9"
                        />
                    </motion.g>
                ))}

                {/* Animated leaves on branches with pulse effect */}
                {leaves.map((leaf) => (
                    <motion.g
                        key={leaf.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, leaf.scale, leaf.scale * 1.05, leaf.scale],
                            opacity: [0, 0.85, 0.9, 0.85],
                            rotate: [0, leaf.rotation, leaf.rotation + 5, leaf.rotation],
                        }}
                        transition={{
                            duration: 1.5,
                            delay: leaf.delay,
                        }}
                    >
                        <motion.g
                            animate={{
                                scale: [1, 1.08, 1],
                                rotate: [-2, 2, -2],
                            }}
                            transition={{
                                duration: 4,
                                delay: leaf.pulseDelay,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <ellipse
                                cx={150 + leaf.x}
                                cy={150 + leaf.y}
                                rx="8"
                                ry="12"
                                fill={leaf.color}
                                opacity="0.8"
                            />
                            <ellipse
                                cx={150 + leaf.x}
                                cy={150 + leaf.y}
                                rx="6"
                                ry="10"
                                fill={leaf.color}
                                opacity="0.5"
                                filter="blur(1px)"
                            />
                        </motion.g>
                    </motion.g>
                ))}
            </svg>

            {/* Falling petals */}
            {fallingPetals.map((petal) => (
                <motion.div
                    key={`petal-${petal.id}`}
                    className="absolute"
                    style={{
                        left: `${petal.startX}%`,
                        top: `${petal.startY}%`,
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        rotate: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: [
                            0,
                            (petal.endX - petal.startX) * 1.5,
                            (petal.endX - petal.startX) * 2,
                            (petal.endX - petal.startX) * 3,
                        ],
                        y: (petal.endY - petal.startY) * 5,
                        rotate: petal.rotation,
                        opacity: [0, 0.9, 0.8, 0],
                        scale: [1, 1.2, 0.9, 0.7],
                    }}
                    transition={{
                        duration: petal.duration,
                        delay: petal.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <ellipse
                            cx="8"
                            cy="8"
                            rx="5"
                            ry="7"
                            fill={petal.color}
                            opacity="0.8"
                        />
                    </svg>
                </motion.div>
            ))}

            {/* Floating falling leaves */}
            {floatingLeaves.map((leaf) => (
                <motion.div
                    key={`floating-${leaf.id}`}
                    className="absolute"
                    style={{
                        left: `${leaf.startX}%`,
                        top: `${leaf.startY}%`,
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        rotate: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: [
                            (leaf.endX - leaf.startX) * 3,
                            (leaf.endX - leaf.startX) * 3 + 20,
                            (leaf.endX - leaf.startX) * 3,
                        ],
                        y: (leaf.endY - leaf.startY) * 5,
                        rotate: leaf.rotation,
                        opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                        duration: leaf.duration,
                        delay: leaf.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <ellipse
                            cx="10"
                            cy="10"
                            rx="6"
                            ry="9"
                            fill={leaf.color}
                            opacity="0.75"
                        />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};
