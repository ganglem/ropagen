"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SlideHoverLink from "@/components/ui/slide-hover-link";
import ThemeToggle from "@/components/ui/themetoggle";
import { ShineBorder } from "@/components/ui/shine-border";

interface NavPillProps {
    logoSrc: string;
    brandName: string;
    links: { name: string; href: string }[];
    hoverVariant?: "slide" | "color" | "pill";
}

export default function NavPill({
                                      logoSrc,
                                      brandName,
                                      links,
                                      hoverVariant = "slide",
                                  }: NavPillProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);

    // pill position for desktop
    const [pillPos, setPillPos] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsExpanded(true), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isExpanded) {
            const t = setTimeout(() => setShowGenerate(true), 500);
            return () => clearTimeout(t);
        }
    }, [isExpanded]);

    return (
        <div className="relative pointer-events-none w-fit">
            {/* Desktop nav */}
            <motion.ul
                onMouseLeave={() => setPillPos((prev) => ({ ...prev, opacity: 0 }))}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-auto relative flex mx-auto items-center justify-center w-fit rounded-full overflow-hidden border border-white/70 dark:border-white/30 bg-white/10 dark:bg-white/5 backdrop-blur-[2px] shadow-[inset_0_0_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_0_5px_rgba(255,255,255,0.55)] h-12 px-3"
                style={{ gap: 24 }}
            >
                {/* Animated border shimmer like SpotlightCard */}
                <ShineBorder borderWidth={0.3} duration={24} shineColor={["#ffffff","rgba(234,242,255,0.15)","#ffffff"]} className="z-0 opacity-80 dark:opacity-60" />

                {/* Chromatic aberration removed as requested */}
                {/* Logo + Brand */}
                <li className="relative z-10 cursor-pointer text-base flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={logoSrc || "/placeholder.svg"}
                            alt={brandName}
                            width={30}
                            height={30}
                            className="h-6 w-6"
                        />
                        <span className="font-bold text-lg text-foreground">{brandName}</span>
                    </Link>
                </li>

                {/* Only render links and theme toggle after isExpanded */}
                {isExpanded && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex items-center gap-6 ml-auto"
                    >
                        {/* Links */}
                        {links.map(({ name, href }, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: showGenerate ? 1 : 0 }}
                                transition={{ duration: 0.5, delay: showGenerate ? idx * 0.1 : 0 }}
                                className="relative z-10 text-base text-foreground group flex items-center"
                                onMouseEnter={(e) => {
                                    if (hoverVariant !== "pill") return;
                                    const target = e.currentTarget as HTMLDivElement;
                                    const rect = target.getBoundingClientRect();
                                    setPillPos({
                                        left: target.offsetLeft,
                                        width: rect.width,
                                        opacity: 1,
                                    });
                                }}
                                style={{ padding: "8px 16px" }}
                            >
                                {hoverVariant === "slide" ? (
                                    <Link href={href}>
                                        <SlideHoverLink text={name} />
                                    </Link>
                                ) : hoverVariant === "color" ? (
                                    <Link href={href}>
                                        <span className="group inline-block">
                                            <span className="transition-colors duration-200 group-hover:text-accent">
                                                {name}
                                            </span>
                                        </span>
                                    </Link>
                                ) : (
                                    <Link href={href}>
                                        <span className="relative z-10 transition-colors duration-200 group-hover:text-accent-foreground">
                                            {name}
                                        </span>
                                    </Link>
                                )}
                            </motion.div>
                        ))}

                        {/* ThemeToggle */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showGenerate ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: showGenerate ? links.length * 0.1 : 0 }}
                            className="flex items-center"
                        >
                            <ThemeToggle />
                        </motion.div>
                    </motion.div>
                )}

                {/* Sliding pill */}
                {hoverVariant === "pill" && (
                    <motion.li
                        initial={{ left: 0, width: 0, opacity: 0 }}
                        animate={pillPos}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute z-[1] inset-y-1 rounded-full bg-accent"
                        style={{ left: pillPos.left, width: pillPos.width }}
                    />
                )}
            </motion.ul>

        </div>
    );
}
