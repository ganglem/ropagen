"use client";

import RopaForm from "@/components/ropa-form";
import RopaPreview from "@/components/ropa-preview";
import {useState} from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RopaChat from "@/components/ropa-chat";
import RopaExplain from "@/components/ropa-explain";
import {useTranslations} from "next-intl";


export default function Generate() {

    const t = useTranslations('Generate');
    const [generatedDocument, setGeneratedDocument] = useState<string>("");

    return (
        <main className="container mx-auto py-10 relative space-y-6 w-full">
            <Tabs defaultValue="mode1" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="mode1">{t("tabForm")}</TabsTrigger>
                    <TabsTrigger value="mode2">{t("tabExplain")}</TabsTrigger>
                    <TabsTrigger value="mode3">{t("tabChat")}</TabsTrigger>
                </TabsList>

                <TabsContent value="mode1" className="space-y-6">
                    <RopaForm setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>

                <TabsContent value="mode2" className="space-y-6">
                    <RopaExplain setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>

                <TabsContent value="mode3" className="space-y-6">
                    <RopaChat setGeneratedDocument={setGeneratedDocument}/>
                    {generatedDocument != "" && <RopaPreview generatedDocument={generatedDocument} setGeneratedDocument={setGeneratedDocument}/>}
                </TabsContent>
            </Tabs>
        </main>
    )
}