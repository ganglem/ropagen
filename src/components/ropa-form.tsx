"use client";

import { Category } from "@/models/DocumentData";
import {ChangeEvent, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {generateDocument} from "@/actions/actions";
import { Loader2 } from "lucide-react"
import RopaTemplateSelector from "./ropa-template-selector";
import {useTranslations} from "next-intl";
import { availableModels, defaultModel } from "@/config/models";

export default function RopaForm({setGeneratedDocument}: {setGeneratedDocument: (doc: string) => void}) {

    const t = useTranslations('Generate');

    const [documentData, setDocumentData] = useState({
        title: "",
        categories:
            Object.values(Category).reduce(
                (acc, category) => ({ ...acc, [category]: false }),
                {} as Record<Category, boolean>
            ),
        additionalInfo: "",
    });

    const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
    const [isGenerating, setIsGenerating] = useState<boolean>(false)

    function handleTitleChange(title: string) {
        setDocumentData({...documentData, title:  title});
    }

    function handleCategoryChange (category: string, checked: boolean) {
        setDocumentData({...documentData, categories: {...documentData.categories, [category]: checked}});
    }

    function handleAdditionalInfoChange (additionalInfo: string) {
        setDocumentData({...documentData, additionalInfo: additionalInfo});
    }

    async function handleGenerateDocument() {
        setIsGenerating(true);
        // @ts-ignore
        const generatedDocument = await generateDocument(documentData, t("locale"), selectedModel);
        setIsGenerating(false);
        setGeneratedDocument(generatedDocument)
    }

    //TODO: translate AI Models

    return (
        <div className="space-y-6 w-full">

            <RopaTemplateSelector onSelect={setDocumentData}></RopaTemplateSelector>

            <Card>
                <CardHeader>
                    <CardTitle>{t("info")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t("infoTitle")}</Label>
                            <Input
                                id="title"
                                placeholder={t("infoPlaceholder")}
                                value={documentData.title}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("categories")}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.keys(Category).map((key) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={key}
                                            checked={documentData.categories[key as Category] || false}
                                            onCheckedChange={(checked) => handleCategoryChange(key, checked === true)}
                                        />
                                        <Label htmlFor={key} className="cursor-pointer">
                                            {Category[key as keyof typeof Category]}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo">{t("additionalInfo")}</Label>
                            <Textarea
                                id="additionalInfo"
                                placeholder={t("additionalInfoPlaceholder")}
                                className="min-h-[150px]"
                                value={documentData.additionalInfo}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleAdditionalInfoChange(e.target.value)}
                            />
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <div className="">
                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger id="model-select">
                                        <SelectValue placeholder="AI model"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableModels.map((model) => (
                                            <SelectItem key={model.name} value={model.name}>
                                                {model.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-auto flex items-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t("generating")}
                                    </>
                                ) : (
                                    t("generateButton")
                                )}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}

