"use client"

import RopaChat from "@/components/ropa-chat";
import StudyGenerate from "@/components/study/study-generate";

export default function ChatGeneratePage() {

    return <StudyGenerate
        mode={"chat"}
        ropaForm={RopaChat}
    />
}