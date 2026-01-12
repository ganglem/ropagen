"use client"

import {useState} from "react";
import RopaPreview from "@/components/ropa-preview";
import RopaForm from "@/components/ropa-form";

export default function FormGeneratePage() {

    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    return (
        <main className="container mx-auto py-10 relative space-y-6 w-full">
            <RopaForm setGeneratedDocument={setGeneratedDocument}/>
            {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
        </main>
    )
}