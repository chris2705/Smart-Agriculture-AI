import React from 'react';
import { motion } from 'framer-motion';

export const PlantBackground = ({ opacity = 0.15 }) => {
    // Generate gentle falling leaves
    const fallingLeaves = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        startX: 5 + Math.random() * 90,
        startY: -10 - Math.random() * 40,
        endY: 110 + Math.random() * 10,
        rotation: Math.random() * 720,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 8,
        size: 15 + Math.random() * 15,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
            {/* Smooth gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-emerald-50/20 to-transparent" />

            {/* Full-screen plant illustration */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMax slice"
            >
                {/* Soil/ground at bottom */}
                <motion.ellipse
                    cx="960"
                    cy="1050"
                    rx="800"
                    ry="80"
                    fill="#8b7355"
                    opacity="0.3"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 0.3, scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Main stem growing from bottom */}
                <motion.path
                    d="M 960 1050 Q 960 900, 960 700 Q 960 500, 960 300"
                    stroke="#4ade80"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                />

                {/* Branch stems */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                >
                    {/* Left branches */}
                    <path d="M 960 800 Q 800 750, 650 700" stroke="#4ade80" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M 960 650 Q 750 600, 550 550" stroke="#4ade80" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M 960 500 Q 800 450, 600 400" stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />

                    {/* Right branches */}
                    <path d="M 960 800 Q 1120 750, 1270 700" stroke="#4ade80" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M 960 650 Q 1170 600, 1370 550" stroke="#4ade80" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M 960 500 Q 1120 450, 1320 400" stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
                </motion.g>

                {/* Leaves spreading across the scene */}
                <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, delay: 2, ease: "easeOut" }}
                >
                    {/* Bottom left cluster */}
                    {[...Array(8)].map((_, i) => (
                        <motion.g
                            key={`bl-${i}`}
                            animate={{
                                rotate: [0, 2, 0, -2, 0],
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 5 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                        >
                            <ellipse
                                cx={600 + i * 40 - Math.random() * 80}
                                cy={850 - i * 30 + Math.random() * 40}
                                rx={40 + Math.random() * 20}
                                ry={60 + Math.random() * 30}
                                fill="#22c55e"
                                opacity={0.4 + Math.random() * 0.2}
                                transform={`rotate(${-30 + Math.random() * 60} ${600 + i * 40} ${850 - i * 30})`}
                            />
                        </motion.g>
                    ))}

                    {/* Bottom right cluster */}
                    {[...Array(8)].map((_, i) => (
                        <motion.g
                            key={`br-${i}`}
                            animate={{
                                rotate: [0, -2, 0, 2, 0],
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 5 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                        >
                            <ellipse
                                cx={1320 - i * 40 + Math.random() * 80}
                                cy={850 - i * 30 + Math.random() * 40}
                                rx={40 + Math.random() * 20}
                                ry={60 + Math.random() * 30}
                                fill="#22c55e"
                                opacity={0.4 + Math.random() * 0.2}
                                transform={`rotate(${-30 + Math.random() * 60} ${1320 - i * 40} ${850 - i * 30})`}
                            />
                        </motion.g>
                    ))}

                    {/* Middle left cluster */}
                    {[...Array(6)].map((_, i) => (
                        <motion.g
                            key={`ml-${i}`}
                            animate={{
                                rotate: [0, 3, 0],
                                scale: [1, 1.03, 1],
                            }}
                            transition={{
                                duration: 6 + i * 0.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.3,
                            }}
                        >
                            <ellipse
                                cx={500 + i * 50 - Math.random() * 100}
                                cy={600 - i * 40 + Math.random() * 50}
                                rx={35 + Math.random() * 15}
                                ry={55 + Math.random() * 25}
                                fill="#4ade80"
                                opacity={0.35 + Math.random() * 0.15}
                                transform={`rotate(${-40 + Math.random() * 80} ${500 + i * 50} ${600 - i * 40})`}
                            />
                        </motion.g>
                    ))}

                    {/* Middle right cluster */}
                    {[...Array(6)].map((_, i) => (
                        <motion.g
                            key={`mr-${i}`}
                            animate={{
                                rotate: [0, -3, 0],
                                scale: [1, 1.03, 1],
                            }}
                            transition={{
                                duration: 6 + i * 0.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.3,
                            }}
                        >
                            <ellipse
                                cx={1420 - i * 50 + Math.random() * 100}
                                cy={600 - i * 40 + Math.random() * 50}
                                rx={35 + Math.random() * 15}
                                ry={55 + Math.random() * 25}
                                fill="#4ade80"
                                opacity={0.35 + Math.random() * 0.15}
                                transform={`rotate(${-40 + Math.random() * 80} ${1420 - i * 50} ${600 - i * 40})`}
                            />
                        </motion.g>
                    ))}

                    {/* Top spreading leaves */}
                    {[...Array(10)].map((_, i) => (
                        <motion.g
                            key={`top-${i}`}
                            animate={{
                                rotate: [0, 2, 0, -2, 0],
                                y: [0, -3, 0],
                            }}
                            transition={{
                                duration: 7 + i * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.4,
                            }}
                        >
                            <ellipse
                                cx={760 + i * 40 + Math.random() * 40}
                                cy={350 - Math.random() * 100}
                                rx={30 + Math.random() * 20}
                                ry={50 + Math.random() * 30}
                                fill="#86efac"
                                opacity={0.3 + Math.random() * 0.15}
                                transform={`rotate(${-45 + Math.random() * 90} ${760 + i * 40} ${350})`}
                            />
                        </motion.g>
                    ))}
                </motion.g>
            </svg>

            {/* Subtle falling leaves overlay */}
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
                        x: [0, 30, -20, 10, 0],
                        rotate: leaf.rotation,
                        opacity: [0, 0.15, 0.12, 0.08, 0],
                    }}
                    transition={{
                        duration: leaf.duration,
                        delay: leaf.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <svg width={leaf.size} height={leaf.size} viewBox="0 0 30 30">
                        <ellipse
                            cx="15"
                            cy="15"
                            rx="8"
                            ry="12"
                            fill="#86efac"
                            opacity="0.5"
                        />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};
