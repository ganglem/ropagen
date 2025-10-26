"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    const [activeTabBounds, setActiveTabBounds] = React.useState<{
        left: number
        width: number
    } | null>(null)
    const listRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const updateActiveTabBounds = () => {
            if (!listRef.current) return
            const activeTab = listRef.current.querySelector('[data-state="active"]')
            if (activeTab) {
                const listRect = listRef.current.getBoundingClientRect()
                const tabRect = activeTab.getBoundingClientRect()
                setActiveTabBounds({
                    left: tabRect.left - listRect.left,
                    width: tabRect.width,
                })
            }
        }

        updateActiveTabBounds()
        const observer = new MutationObserver(updateActiveTabBounds)
        if (listRef.current) {
            observer.observe(listRef.current, {
                attributes: true,
                subtree: true,
                attributeFilter: ["data-state"],
            })
        }

        window.addEventListener("resize", updateActiveTabBounds)
        return () => {
            observer.disconnect()
            window.removeEventListener("resize", updateActiveTabBounds)
        }
    }, [])

    return (
        <TabsPrimitive.List
            ref={listRef}
            data-slot="tabs-list"
            className={cn(
                "bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-full p-[5px]",
                className,
            )}
            {...props}
        >
            {activeTabBounds && (
                <motion.div
                    className="bg-background dark:border-input dark:bg-input/30 absolute rounded-full border border-transparent shadow-sm"
                    initial={false}
                    animate={{
                        left: activeTabBounds.left,
                        width: activeTabBounds.width,
                    }}
                    transition={{
                        type: "spring",
                        bounce: 0.5,
                        duration: 0.4,
                        damping: 15,
                    }}
                    style={{
                        height: "calc(100% - 6px)",
                        top: "3px",
                    }}
                />
            )}
            {props.children}
        </TabsPrimitive.List>
    )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "data-[state=active]:text-primary dark:data-[state=active]:text-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-foreground relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full  p-[10px] text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <AnimatePresence mode="wait">
            <TabsPrimitive.Content
                data-slot="tabs-content"
                className={cn("flex-1 outline-none", className)}
                asChild
                {...props}
            >
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        bounce: 0.5,
                        duration: 0.6,
                        damping: 15,
                    }}
                >
                    {props.children}
                </motion.div>
            </TabsPrimitive.Content>
        </AnimatePresence>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
