import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedSprout = ({ position = 'center', delay = 0 }) => {
    const isCenter = position === 'center';

    // Generate gentle falling leaves
    const fallingLeaves = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        startX: 10 + Math.random() * 80,
        startY: -10 - Math.random() * 30,
        endY: 110 + Math.random() * 10,
        rotation: Math.random() * 360,
        delay: delay + Math.random() * 4,
        duration: 8 + Math.random() * 4,
        size: 12 + Math.random() * 8,
    }));

    return (
        <div className={`fixed ${isCenter ? 'left-1/2 -translate-x-1/2' : position === 'left' ? 'left-8' : 'right-8'} bottom-8 pointer-events-none z-0`}>
            <div className="relative">
                {/* Main sprouting plant */}
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    className="drop-shadow-lg"
                >
                    {/* Seed/soil base */}
                    <motion.ellipse
                        cx="100"
                        cy="160"
                        rx="35"
                        ry="20"
                        fill="#8b7355"
                        opacity="0.6"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        transition={{ duration: 0.8, delay }}
                    />

                    {/* Seed */}
                    <motion.g
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: delay + 0.2, type: "spring" }}
                    >
                        <ellipse
                            cx="100"
                            cy="155"
                            rx="18"
                            ry="22"
                            fill="#6b5544"
                            opacity="0.8"
                        />
                        <ellipse
                            cx="100"
                            cy="155"
                            rx="14"
                            ry="18"
                            fill="#8b7355"
                            opacity="0.6"
                        />
                    </motion.g>

                    {/* Stem sprouting from seed */}
                    <motion.path
                        d="M 100 155 Q 100 140, 100 120"
                        stroke="#4ade80"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: delay + 0.8, ease: "easeOut" }}
                    />

                    {/* Left leaf - sprouting animation */}
                    <motion.g
                        initial={{ scale: 0, rotate: -45, opacity: 0 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1.2,
                            delay: delay + 1.5,
                            type: "spring",
                            stiffness: 100
                        }}
                    >
                        <motion.g
                            animate={{
                                rotate: [-2, 2, -2],
                                y: [0, -2, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: delay + 2.5
                            }}
                        >
                            {/* Leaf shape - left */}
                            <path
                                d="M 100 120 Q 70 115, 60 100 Q 65 110, 75 115 Q 85 118, 100 120"
                                fill="#22c55e"
                                opacity="0.9"
                            />
                            <path
                                d="M 100 120 Q 75 117, 68 108 Q 72 113, 82 117 Q 90 119, 100 120"
                                fill="#4ade80"
                                opacity="0.7"
                            />
                            {/* Leaf vein */}
                            <path
                                d="M 100 120 Q 80 116, 65 105"
                                stroke="#16a34a"
                                strokeWidth="1"
                                fill="none"
                                opacity="0.4"
                            />
                        </motion.g>
                    </motion.g>

                    {/* Right leaf - sprouting animation */}
                    <motion.g
                        initial={{ scale: 0, rotate: 45, opacity: 0 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1.2,
                            delay: delay + 1.7,
                            type: "spring",
                            stiffness: 100
                        }}
                    >
                        <motion.g
                            animate={{
                                rotate: [2, -2, 2],
                                y: [0, -2, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: delay + 2.7
                            }}
                        >
                            {/* Leaf shape - right */}
                            <path
                                d="M 100 120 Q 130 115, 140 100 Q 135 110, 125 115 Q 115 118, 100 120"
                                fill="#22c55e"
                                opacity="0.9"
                            />
                            <path
                                d="M 100 120 Q 125 117, 132 108 Q 128 113, 118 117 Q 110 119, 100 120"
                                fill="#4ade80"
                                opacity="0.7"
                            />
                            {/* Leaf vein */}
                            <path
                                d="M 100 120 Q 120 116, 135 105"
                                stroke="#16a34a"
                                strokeWidth="1"
                                fill="none"
                                opacity="0.4"
                            />
                        </motion.g>
                    </motion.g>

                    {/* Sparkle effect when sprouting */}
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                        transition={{
                            duration: 1.5,
                            delay: delay + 1.5,
                            ease: "easeOut"
                        }}
                    >
                        <circle cx="80" cy="110" r="3" fill="#86efac" opacity="0.8" />
                        <circle cx="120" cy="110" r="3" fill="#86efac" opacity="0.8" />
                        <circle cx="100" cy="100" r="2" fill="#d9f99d" opacity="0.9" />
                    </motion.g>
                </svg>

                {/* Gentle falling leaves in background */}
                {fallingLeaves.map((leaf) => (
                    <motion.div
                        key={`falling-${leaf.id}`}
                        className="absolute"
                        style={{
                            left: `${leaf.startX}%`,
                            top: `${leaf.startY}%`,
                        }}
                        initial={{
                            y: 0,
                            x: 0,
                            rotate: 0,
                            opacity: 0,
                        }}
                        animate={{
                            y: `${leaf.endY}vh`,
                            x: [0, 20, -10, 0],
                            rotate: leaf.rotation,
                            opacity: [0, 0.4, 0.3, 0],
                        }}
                        transition={{
                            duration: leaf.duration,
                            delay: leaf.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <svg width={leaf.size} height={leaf.size} viewBox="0 0 20 20">
                            <ellipse
                                cx="10"
                                cy="10"
                                rx="6"
                                ry="9"
                                fill="#86efac"
                                opacity="0.6"
                            />
                        </svg>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
