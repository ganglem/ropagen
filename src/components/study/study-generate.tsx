"use client"

import {useSearchParams} from "next/dist/client/components/navigation";
import {useState} from "react";
import RopaPreview from "@/components/ropa-preview";

export default function StudyGenerate({
    ropaForm: RopaFormComponent,
    mode
}: {
    ropaForm: React.ComponentType<{ setGeneratedDocument: (doc: string) => void }>,
    mode: "chat" | "ask" | "form"
}) {

    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    if (!userId) {
        return <div className="container mx-auto py-10 relative space-y-6 w-full">
            <p className="text-red-500">User ID is required to generate a document.</p>
        </div>
    }

    return (
        <div className="container mx-auto py-10 relative space-y-6 w-full">
            <RopaFormComponent setGeneratedDocument={setGeneratedDocument}/>
            {generatedDocument != "" && <RopaPreview
                generatedDocument={generatedDocument}
                setGeneratedDocument={setGeneratedDocument}
                userId={userId}
                mode={mode}
            />}
        </div>
    )
}