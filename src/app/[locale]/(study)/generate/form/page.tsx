"use client"

import RopaForm from "@/components/ropa-form";
import StudyGenerate from "@/components/study/study-generate";

export default function FormGeneratePage() {

    return <StudyGenerate
        mode={"form"}
        ropaForm={RopaForm}
    />
}