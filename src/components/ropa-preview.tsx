import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ShineBorder} from "@/components/ui/shine-border";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTranslations} from "next-intl";
import {Download, Eye, Edit, Loader2} from "lucide-react";
import {useState, useEffect} from "react";
import {marked} from "marked";

export default function RopaPreview({generatedDocument, setGeneratedDocument}: { generatedDocument: string, setGeneratedDocument: (doc: string) => void }) {

    const t = useTranslations('Preview');
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [downloadFormat, setDownloadFormat] = useState<'markdown' | 'text' | 'json' | 'pdf'>('pdf');
    const [isGenerating, setIsGenerating] = useState(false);

    // Configure marked for consistent rendering
    useEffect(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    // Clean markdown content for rendering - always remove code block markers
    const getCleanMarkdown = (markdown: string) => {
        let cleanMarkdown = markdown.trim();

        // Handle the case where content is wrapped in code blocks with additional content after
        const codeBlockPattern = /^```(?:markdown)?\s*([\s\S]*?)\s*```\s*([\s\S]*)$/;
        const match = cleanMarkdown.match(codeBlockPattern);

        if (match) {
            // If there's content after the closing ```, combine it with the main content
            const mainContent = match[1] || '';
            const afterContent = match[2] || '';

            if (afterContent.trim()) {
                // Combine main content with after content, separated by double newline
                cleanMarkdown = mainContent + '\n\n' + afterContent;
            } else {
                cleanMarkdown = mainContent;
            }
        } else {
            // Fallback: remove markdown code block markers if they exist
            if (cleanMarkdown.startsWith('```markdown')) {
                cleanMarkdown = cleanMarkdown.replace(/^```markdown\s*/, '');
            }
            if (cleanMarkdown.startsWith('```')) {
                cleanMarkdown = cleanMarkdown.replace(/^```\s*/, '');
            }
            if (cleanMarkdown.endsWith('```')) {
                cleanMarkdown = cleanMarkdown.replace(/\s*```$/, '');
            }
        }

        return cleanMarkdown.trim();
    };

    // Strip markdown syntax for plain text
    const stripMarkdownSyntax = (markdown: string) => {
        const cleanMd = getCleanMarkdown(markdown);
        return cleanMd
            // Remove headers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove bold/italic
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/_(.*?)_/g, '$1')
            // Remove links but keep text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove inline code
            .replace(/`([^`]+)`/g, '$1')
            // Remove blockquotes
            .replace(/^>\s+/gm, '')
            // Remove list markers
            .replace(/^[\s]*[-*+]\s+/gm, '• ')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // Remove horizontal rules
            .replace(/^---+$/gm, '')
            // Clean up extra whitespace
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    };

    // Update the document state to always store clean markdown
    useEffect(() => {
        if (generatedDocument) {
            const cleaned = getCleanMarkdown(generatedDocument);
            if (cleaned !== generatedDocument) {
                setGeneratedDocument(cleaned);
            }
        }
    }, []);

    // Convert markdown to HTML
    const getRenderedHtml = () => {
        try {
            const cleanMarkdown = getCleanMarkdown(generatedDocument);
            return marked(cleanMarkdown);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return '<p>Error rendering markdown</p>';
        }
    };

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
    };

    const downloadAsMarkdown = () => {
        // Add markdown code block wrapper for .md download
        const markdownContent = `\`\`\`markdown\n${getCleanMarkdown(generatedDocument)}\n\`\`\``;
        downloadFile(markdownContent, 'ropa-document.md', 'text/markdown');
    };

    const downloadAsText = () => {
        // Strip all markdown syntax for plain text
        const plainText = stripMarkdownSyntax(generatedDocument);
        downloadFile(plainText, 'ropa-document.txt', 'text/plain');
    };

    const downloadAsJson = () => {
        const jsonData = {
            document: generatedDocument, // Keep as-is for JSON
            generatedAt: new Date().toISOString(),
            format: "ROPA Document",
            version: "1.0"
        };
        downloadFile(JSON.stringify(jsonData, null, 2), 'ropa-document.json', 'application/json');
    };

    const downloadAsPdf = async () => {
        try {
            setIsGenerating(true);

            // Send clean markdown (no code block wrappers) to PDF API
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: getCleanMarkdown(generatedDocument)
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
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        switch (downloadFormat) {
            case 'markdown':
                downloadAsMarkdown();
                break;
            case 'text':
                downloadAsText();
                break;
            case 'json':
                downloadAsJson();
                break;
            case 'pdf':
                downloadAsPdf();
                break;
        }
    };

    const getDownloadButtonText = () => {
        const downloadPrefix = t("downloadAs");
        switch (downloadFormat) {
            case 'markdown':
                return `${downloadPrefix} .md`;
            case 'text':
                return `${downloadPrefix} .txt`;
            case 'json':
                return `${downloadPrefix} .json`;
            case 'pdf':
                return `${downloadPrefix} .pdf`;
            default:
                return t("downloadDocument");
        }
    };


    return (
        <Card className="relative overflow-hidden w-full mt-8">
            <ShineBorder shineColor={["#7440ff", "#ffc200"]} />
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center justify-between w-full gap-4">
                    <CardTitle>{t("generatedDocument")}</CardTitle>
                    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                        <Button
                            variant={viewMode === 'edit' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('edit')}
                            className="h-8 px-3 text-xs"
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            {t("edit")}
                        </Button>
                        <Button
                            variant={viewMode === 'preview' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('preview')}
                            className="h-8 px-3 text-xs"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            {t("preview")}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {viewMode === 'edit' ? (
                    <Textarea
                        className="max-h-[500px] min-h-[200px] font-mono text-sm"
                        value={generatedDocument}
                        onChange={e => setGeneratedDocument(e.target.value)}
                        placeholder="Your generated document will appear here..."
                    />
                ) : (
                    <div
                        className="max-h-[500px] min-h-[200px] field-sizing-content overflow-auto prose prose-sm max-w-none px-3 py-2 bg-background border border-border rounded-xl"
                        style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", Roboto, Helvetica, Arial, sans-serif',
                            fontSize: 'md:text-sm text-base',
                            lineHeight: '1.8',
                            color: 'text-foreground'
                        }}
                        //@ts-ignore
                        dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
                    />
                )}
                <div className="flex items-center justify-end mt-4 gap-2">
                    <Select value={downloadFormat} onValueChange={(value: 'markdown' | 'text' | 'json' | 'pdf') => setDownloadFormat(value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="markdown">{t("markdown")}</SelectItem>
                            <SelectItem value="text">{t("text")}</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                        data-pdf-btn
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isGenerating ? t("generatingPdf") : getDownloadButtonText()}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
