"use client"

import RopaAsk from "@/components/ropa-ask";
import StudyGenerate from "@/components/study/study-generate";

export default function AskGeneratePage() {

    return <StudyGenerate
        mode={"ask"}
        ropaForm={RopaAsk}
    />
}