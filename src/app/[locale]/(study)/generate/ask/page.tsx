"use client"

import RopaPreview from "@/components/ropa-preview";
import RopaExplain from "@/components/ropa-explain";
import {useState} from "react";

export default function AskGeneratePage() {

    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    return (
        <main className="container mx-auto py-10 relative space-y-6 w-full">
            <RopaExplain setGeneratedDocument={setGeneratedDocument}/>
            {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
        </main>
    )
}