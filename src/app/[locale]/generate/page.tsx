"use client";

import RopaForm from "@/components/ropa-form";
import RopaPreview from "@/components/ropa-preview";
import {useState} from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RopaChat from "@/components/ropa-chat.tsx";
import RopaExplain from "@/components/ropa-explain";


export default function Generate() {

    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    return (
        <main className="container mx-auto py-10 relative space-y-6 w-full">
            <Tabs defaultValue="mode1" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="mode1">Mode 1</TabsTrigger>
                    <TabsTrigger value="mode2">Mode 2</TabsTrigger>
                    <TabsTrigger value="mode3">Mode 3</TabsTrigger>
                </TabsList>

                <TabsContent value="mode1" className="space-y-6">
                    <RopaForm setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>

                <TabsContent value="mode2" className="space-y-6">
                    <RopaChat setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>

                <TabsContent value="mode3" className="space-y-6">
                    <RopaExplain setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>
            </Tabs>
        </main>
    )
}