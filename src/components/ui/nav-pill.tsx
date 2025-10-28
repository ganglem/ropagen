"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import SlideHoverLink from "@/components/ui/slide-hover-link"
import ThemeToggle from "@/components/ui/themetoggle"
import LocaleSwitch from "@/components/ui/locale-switch"
import { ShineBorder } from "@/components/ui/shine-border"
import { Menu, X } from "lucide-react"
import { AuthButtonClient } from "@/components/auth-button-client"

interface NavPillProps {
    logoSrc: string
    brandName: string
    links: { name: string; href: string }[]
    hoverVariant?: "slide" | "color" | "pill"
    locale: string
}

export default function NavPill({ logoSrc, brandName, links, hoverVariant = "slide", locale }: NavPillProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showGenerate, setShowGenerate] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // pill position for desktop
    const [pillPos, setPillPos] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    })

    useEffect(() => {
        const timer = setTimeout(() => setIsExpanded(true), 800)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (isExpanded) {
            const t = setTimeout(() => setShowGenerate(true), 500)
            return () => clearTimeout(t)
        }
    }, [isExpanded])

    return (
        <div className="relative pointer-events-none w-fit">
            {/* Desktop nav */}
            <motion.ul
                onMouseLeave={() => setPillPos((prev) => ({ ...prev, opacity: 0 }))}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`pointer-events-auto relative md:flex hidden mx-auto items-center justify-center w-fit rounded-4xl overflow-hidden border border-white/70 dark:border-white/30 bg-white/10 dark:bg-white/5 backdrop-blur-[2px] shadow-[inset_0_0_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_0_5px_rgba(255,255,255,0.55)] h-12 px-3`}
                style={{ gap: 24 }}
            >
                {/* Animated border shimmer like SpotlightCard */}
                <ShineBorder
                    borderWidth={0.3}
                    duration={24}
                    shineColor={["#ffffff", "rgba(234,242,255,0.15)", "#ffffff"]}
                    className="z-0 opacity-80 dark:opacity-60"
                />

                {/* Logo + Brand */}
                <li className="relative z-10 cursor-pointer text-base flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src={logoSrc || "/placeholder.svg"} alt={brandName} width={30} height={30} className="h-6 w-6" />
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
                                    if (hoverVariant !== "pill") return
                                    const target = e.currentTarget as HTMLDivElement
                                    const rect = target.getBoundingClientRect()
                                    setPillPos({
                                        left: target.offsetLeft,
                                        width: rect.width,
                                        opacity: 1,
                                    })
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
                      <span className="transition-colors duration-200 group-hover:text-accent">{name}</span>
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

                        {/* LocaleSwitch */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showGenerate ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: showGenerate ? links.length * 0.1 : 0 }}
                            className="flex items-center"
                        >
                            <LocaleSwitch currentLocale={locale} />
                        </motion.div>

                        {/* ThemeToggle */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showGenerate ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: showGenerate ? (links.length + 1) * 0.1 : 0 }}
                            className="flex items-center"
                        >
                            <ThemeToggle />
                        </motion.div>

                        {/* AuthButton - ganz rechts */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showGenerate ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: showGenerate ? (links.length + 2) * 0.1 : 0 }}
                            className="flex items-center"
                        >
                            <AuthButtonClient locale={locale} />
                        </motion.div>
                    </motion.div>
                )}

                {/* Sliding pill */}
                {hoverVariant === "pill" && (
                    <motion.li
                        initial={{ left: 0, width: 0, opacity: 0 }}
                        animate={pillPos}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute z-[1] inset-y-1 rounded-4xl bg-accent"
                        style={{ left: pillPos.left, width: pillPos.width }}
                    />
                )}
            </motion.ul>

            {/* Mobile nav */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="md:hidden pointer-events-auto relative"
            >
                <motion.div
                    className="relative overflow-hidden rounded-[24px] border border-white/70 dark:border-white/30 bg-white/10 dark:bg-white/5 backdrop-blur-[2px] shadow-[inset_0_0_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_0_5px_rgba(255,255,255,0.55)]"
                >
                    <ShineBorder
                        borderWidth={0.3}
                        duration={24}
                        shineColor={["#ffffff", "rgba(234,242,255,0.15)", "#ffffff"]}
                        className="z-0 opacity-80 dark:opacity-60"
                    />

                    {/* Header row with logo and hamburger */}
                    <div className="flex items-center justify-between h-12 px-3">
                        {/* Logo + Brand */}
                        <Link href="/" className="flex items-center gap-2 relative z-10">
                            <Image src={logoSrc || "/placeholder.svg"} alt={brandName} width={30} height={30} className="h-6 w-6" />
                            <span className="font-bold text-lg text-foreground">{brandName}</span>
                        </Link>

                        {/* Right side: Hamburger - expand and float in like desktop */}
                        {isExpanded && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex items-center gap-3 relative z-10 ml-4"
                            >
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: showGenerate ? 1 : 0, scale: showGenerate ? 1 : 0.8 }}
                                    transition={{ duration: 0.5 }}
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="text-foreground hover:text-accent transition-colors p-1"
                                    aria-label="Toggle menu"
                                >
                                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                </motion.button>
                            </motion.div>
                        )}
                    </div>

                    <AnimatePresence initial={false}>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col items-end gap-2 py-3 px-4 relative z-10">
                                    {links.map(({ name, href }, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: idx * 0.05, duration: 0.2 }}
                                        >
                                            <Link
                                                href={href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="text-base py-2 block"
                                            >
                                                {hoverVariant === "slide" ? (
                                                    <SlideHoverLink text={name} />
                                                ) : hoverVariant === "color" ? (
                                                    <span className="group inline-block">
                                                        <span className="transition-colors duration-200 group-hover:text-accent">{name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="transition-colors duration-200 hover:text-accent-foreground">
                                                        {name}
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.div>
                                    ))}
                                    {/* Locale Switch */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: links.length * 0.05, duration: 0.2 }}
                                        className="py-2"
                                    >
                                        <LocaleSwitch currentLocale={locale} />
                                    </motion.div>
                                    {/* Theme Toggle as last item */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: (links.length + 1) * 0.05, duration: 0.2 }}
                                        className="py-2"
                                    >
                                        <ThemeToggle />
                                    </motion.div>

                                    {/* AuthButton im Mobile Menu */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: (links.length + 2) * 0.05, duration: 0.2 }}
                                        className="py-2"
                                    >
                                        <AuthButtonClient locale={locale} />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    )
}
