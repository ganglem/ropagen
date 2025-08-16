import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ShineBorder} from "@/components/ui/shine-border";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Download, ChevronDown} from "lucide-react";
import {useState, useEffect, useRef} from "react";

export default function RopaPreview({generatedDocument, setGeneratedDocument}: { generatedDocument: string, setGeneratedDocument: (doc: string) => void }) {

    const t = useTranslations('Preview');
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDownloadOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowDownloadOptions(false);
    };

    const downloadAsMarkdown = () => {
        downloadFile(generatedDocument, 'ropa-document.md', 'text/markdown');
    };

    const downloadAsText = () => {
        downloadFile(generatedDocument, 'ropa-document.txt', 'text/plain');
    };

    const downloadAsJson = () => {
        const jsonData = {
            document: generatedDocument,
            generatedAt: new Date().toISOString(),
            format: "ROPA Document",
            version: "1.0"
        };
        downloadFile(JSON.stringify(jsonData, null, 2), 'ropa-document.json', 'application/json');
    };

    const downloadAsPdf = async () => {
        try {
            // Show loading state
            const originalText = document.querySelector('[data-pdf-btn]')?.textContent;
            const pdfButton = document.querySelector('[data-pdf-btn]') as HTMLButtonElement;
            if (pdfButton) {
                pdfButton.textContent = 'Generating PDF...';
                pdfButton.disabled = true;
            }

            // Call the API endpoint
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: generatedDocument
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }

            // Get the PDF blob
            const pdfBlob = await response.blob();

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ropa-document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setShowDownloadOptions(false);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            // Restore button state
            const pdfButton = document.querySelector('[data-pdf-btn]') as HTMLButtonElement;
            if (pdfButton) {
                pdfButton.textContent = 'PDF';
                pdfButton.disabled = false;
            }
        }
    };

    return (
        <Card className="relative overflow-hidden w-full mt-8">
            <ShineBorder shineColor={["#7440ff", "#ffc200"]} />
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("generatedDocument")}</CardTitle>
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="outline"
                        onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        {t("downloadDocument")}
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {showDownloadOptions && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-md shadow-lg z-10">
                            <div className="p-2">
                                <p className="text-sm font-medium mb-2 px-2">{t("downloadAs")}:</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadAsMarkdown}
                                    className="w-full justify-start mb-1"
                                >
                                    {t("markdown")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadAsText}
                                    className="w-full justify-start mb-1"
                                >
                                    {t("text")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadAsJson}
                                    className="w-full justify-start mb-1"
                                >
                                    {t("json")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadAsPdf}
                                    className="w-full justify-start"
                                    data-pdf-btn
                                >
                                    {t("pdf")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    className="max-h-[500px] min-h-[200px]"
                    defaultValue={generatedDocument}
                    onChange={e => setGeneratedDocument(e.target.value)}
                />
            </CardContent>
        </Card>
    )
}
