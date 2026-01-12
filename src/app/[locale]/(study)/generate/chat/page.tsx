"use client"

import {useState} from "react";
import RopaPreview from "@/components/ropa-preview";
import RopaChat from "@/components/ropa-chat";

export default function ChatGeneratePage() {

    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    return (
        <main className="container mx-auto py-10 relative space-y-6 w-full">
            <RopaChat setGeneratedDocument={setGeneratedDocument}/>
            {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
        </main>
    )
}