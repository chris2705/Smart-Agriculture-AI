import React, { useMemo } from 'react';

export const PlantBackground = ({ opacity = 1 }) => {
    // Generate random falling leaves
    const fallingLeaves = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 6,
            size: 10 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.4,
            rotationStart: Math.random() * 360,
            rotationEnd: Math.random() * 720,
        }));
    }, []);

    // Generate fireflies/pollen
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 4,
            size: 2 + Math.random() * 4,
        }));
    }, []);

    // Generate butterflies
    const butterflies = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            left: 10 + Math.random() * 80,
            top: 15 + Math.random() * 60,
            delay: Math.random() * 2,
            duration: 18 + Math.random() * 12,
            scale: 0.5 + Math.random() * 0.5,
            color: ['#fbbf24', '#f87171', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 4)]
        }));
    }, []);

    // Generate bees
    const bees = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            id: i,
            left: 5 + Math.random() * 90,
            top: 20 + Math.random() * 60,
            delay: Math.random() * 5,
            duration: 12 + Math.random() * 8,
            scale: 0.7 + Math.random() * 0.3,
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ opacity, zIndex: -1 }}>
            <style>{`
                @keyframes fallingLeaf {
                    0% {
                        transform: translateY(-100px) rotateZ(0deg) translateX(0px);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.9;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(calc(100vh + 100px)) rotateZ(360deg) translateX(50px);
                        opacity: 0;
                    }
                }

                @keyframes sway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
                    25% { transform: translateY(-20px) translateX(10px); opacity: 0.9; }
                    50% { transform: translateY(0px) translateX(20px); opacity: 0.6; }
                    75% { transform: translateY(20px) translateX(10px); opacity: 0.4; }
                }

                @keyframes grassSway {
                    0%, 100% { transform: skewX(-2deg); }
                    50% { transform: skewX(2deg); }
                }

                @keyframes flyComplex {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(60px, -40px) rotate(10deg); }
                    50% { transform: translate(120px, 0px) rotate(0deg); }
                    75% { transform: translate(60px, 40px) rotate(-10deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }

                @keyframes beeMove {
                    0% { transform: translate(0, 0); }
                    33% { transform: translate(30px, -20px); }
                    66% { transform: translate(-20px, 10px); }
                    100% { transform: translate(0, 0); }
                }

                @keyframes wingFlap {
                    0%, 100% { transform: scaleX(1); }
                    50% { transform: scaleX(0.2); }
                }

                @keyframes beeWing {
                    0%, 100% { opacity: 0.4; transform: scaleY(1); }
                    50% { opacity: 0.8; transform: scaleY(0.2); }
                }

                .falling-leaf {
                    position: absolute;
                    animation: fallingLeaf linear infinite;
                    top: -50px;
                }

                .particle {
                    position: absolute;
                    background: radial-gradient(circle, rgba(255,255,220,0.9) 0%, rgba(255,255,255,0) 70%);
                    border-radius: 50%;
                    animation: float ease-in-out infinite;
                }

                .background-gradient {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 0%, #f0fdf4 0%, #dcfce7 20%, #bbf7d0 50%, #86efac 80%, #4ade80 100%);
                }

                .vine {
                    animation: sway 8s ease-in-out infinite;
                    transform-origin: top center;
                }

                .grass-layer {
                    position: absolute;
                    bottom: -20px;
                    left: 0;
                    width: 100%;
                    height: 150px;
                    background-repeat: repeat-x;
                    background-size: 50% 100%;
                    opacity: 0.9;
                    animation: grassSway 6s ease-in-out infinite;
                    transform-origin: bottom;
                }

                .butterfly-wrapper {
                    position: absolute;
                    animation: flyComplex ease-in-out infinite;
                }
                
                .butterfly-wing-l, .butterfly-wing-r {
                    animation: wingFlap 0.15s ease-in-out infinite;
                    transform-origin: center;
                }

                .bee-wrapper {
                    position: absolute;
                    animation: beeMove ease-in-out infinite;
                }

                .bee-wings {
                    animation: beeWing 0.05s linear infinite;
                    transform-origin: center;
                }
            `}</style>

            {/* Lush Gradient Background */}
            <div className="background-gradient" />

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />

            {/* Hanging Vines - Left */}
            <svg className="absolute top-0 left-0 w-64 h-96 vine" style={{ animationDelay: '0s', opacity: 0.9 }} viewBox="0 0 100 200" preserveAspectRatio="none">
                <path d="M10,0 Q20,50 10,100 T20,200" stroke="#86efac" strokeWidth="3" fill="none" />
                <path d="M30,0 Q10,40 30,90 T10,180" stroke="#4ade80" strokeWidth="2" fill="none" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <circle key={i} cx={10 + (i % 2) * 10} cy={20 + i * 25} r="4" fill="#22c55e" />
                ))}
            </svg>

            {/* Hanging Vines - Right */}
            <svg className="absolute top-0 right-0 w-56 h-80 vine" style={{ animationDelay: '-4s', opacity: 0.9 }} viewBox="0 0 100 200" preserveAspectRatio="none">
                <path d="M80,0 Q60,60 80,120 T70,200" stroke="#86efac" strokeWidth="3" fill="none" />
                <path d="M60,0 Q90,50 60,110" stroke="#4ade80" strokeWidth="2" fill="none" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <circle key={i} cx={80 - (i % 2) * 15} cy={30 + i * 30} r="5" fill="#22c55e" />
                ))}
            </svg>

            {/* Particles (Pollen/Fireflies) */}
            {particles.map((p) => (
                <div
                    key={`particle-${p.id}`}
                    className="particle"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}

            {/* Falling Leaves */}
            {fallingLeaves.map((leaf) => (
                <div
                    key={`leaf-${leaf.id}`}
                    className="falling-leaf"
                    style={{
                        left: `${leaf.left}%`,
                        animationDuration: `${leaf.duration}s`,
                        animationDelay: `${leaf.delay}s`,
                    }}
                >
                    <svg width={leaf.size} height={leaf.size} viewBox="0 0 30 30" fill="none" style={{ transform: `rotate(${leaf.rotationStart}deg)` }}>
                        <path
                            d="M 15 5 Q 23 10 23 15 Q 23 23 15 28 Q 7 23 7 15 Q 7 10 15 5"
                            fill={['#4ade80', '#86efac', '#22c55e'][leaf.id % 3]}
                            opacity={leaf.opacity + 0.3}
                        />
                        <path d="M 15 5 Q 15 15 15 28" stroke="#15803d" strokeWidth="0.5" opacity="0.6" />
                    </svg>
                </div>
            ))}

            {/* Butterflies */}
            {butterflies.map((b) => (
                <div
                    key={`butterfly-${b.id}`}
                    className="butterfly-wrapper"
                    style={{
                        left: `${b.left}%`,
                        top: `${b.top}%`,
                        width: '30px',
                        height: '30px',
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`,
                        transform: `scale(${b.scale})`,
                    }}
                >
                    <svg viewBox="0 0 24 24" width="100%" height="100%" overflow="visible">
                        <g className="butterfly-wing-l">
                            <path d="M12 12 C 12 12, 8 2, 2 8 C 2 8, 4 16, 12 12" fill={b.color} stroke="#78350f" strokeWidth="0.5" opacity="0.9" />
                            <path d="M12 12 C 12 12, 8 22, 2 18 C 2 18, 4 16, 12 12" fill={b.color} stroke="#78350f" strokeWidth="0.5" opacity="0.9" />
                        </g>
                        <g className="butterfly-wing-r">
                            <path d="M12 12 C 12 12, 16 2, 22 8 C 22 8, 20 16, 12 12" fill={b.color} stroke="#78350f" strokeWidth="0.5" opacity="0.9" />
                            <path d="M12 12 C 12 12, 16 22, 22 18 C 22 18, 20 16, 12 12" fill={b.color} stroke="#78350f" strokeWidth="0.5" opacity="0.9" />
                        </g>
                        <circle cx="12" cy="12" r="1.5" fill="#584c36" />
                    </svg>
                </div>
            ))}

            {/* Bees */}
            {bees.map((b) => (
                <div
                    key={`bee-${b.id}`}
                    className="bee-wrapper"
                    style={{
                        left: `${b.left}%`,
                        top: `${b.top}%`,
                        width: '24px',
                        height: '24px',
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`,
                        transform: `scale(${b.scale})`,
                    }}
                >
                    <svg viewBox="0 0 20 20" width="100%" height="100%" overflow="visible">
                        <g className="bee-wings">
                            <ellipse cx="10" cy="6" rx="6" ry="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                        </g>
                        <ellipse cx="10" cy="10" rx="5" ry="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
                        <line x1="8" y1="7" x2="8" y2="13" stroke="#78350f" strokeWidth="1.5" />
                        <line x1="12" y1="7" x2="12" y2="13" stroke="#78350f" strokeWidth="1.5" />
                    </svg>
                </div>
            ))}

            {/* Foreground Grass Silhouette (Abstract) */}
            <div className="absolute bottom-0 w-full h-24 pointer-events-none fade-in-up" style={{ opacity: 0.9 }}>
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
                    <path d="M0,100 
                             L0,80 Q20,50 40,80 T80,80 T120,60 T160,90 
                             L200,100 L200,70 Q230,40 260,90 T320,60 
                             L400,100 L400,85 Q430,20 450,90 T500,70
                             L600,100 L600,60 Q650,90 700,40 T800,90
                             L900,100 L900,75 Q950,30 1000,80 T1100,60
                             L1200,100 Z"
                        fill="#15803d" />
                </svg>
            </div>
        </div>
    );
};
