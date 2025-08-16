import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ShineBorder} from "@/components/ui/shine-border";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Download, ChevronDown, Eye, Edit} from "lucide-react";
import {useState, useEffect, useRef} from "react";
import {marked} from "marked";

export default function RopaPreview({generatedDocument, setGeneratedDocument}: { generatedDocument: string, setGeneratedDocument: (doc: string) => void }) {

    const t = useTranslations('Preview');
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            // Show loading state
            const originalText = document.querySelector('[data-pdf-btn]')?.textContent;
            const pdfButton = document.querySelector('[data-pdf-btn]') as HTMLButtonElement;
            if (pdfButton) {
                pdfButton.textContent = 'Generating PDF...';
                pdfButton.disabled = true;
            }

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
                <div className="flex items-center gap-4">
                    <CardTitle>{t("generatedDocument")}</CardTitle>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button
                            variant={viewMode === 'edit' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('edit')}
                            className="h-8 px-3 text-xs"
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant={viewMode === 'preview' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('preview')}
                            className="h-8 px-3 text-xs"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                        </Button>
                    </div>
                </div>
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
                {viewMode === 'edit' ? (
                    <Textarea
                        className="max-h-[500px] min-h-[200px] font-mono text-sm"
                        value={generatedDocument}
                        onChange={e => setGeneratedDocument(e.target.value)}
                        placeholder="Your generated document will appear here..."
                    />
                ) : (
                    <div
                        className="max-h-[500px] min-h-[200px] overflow-auto prose prose-sm max-w-none p-4 bg-muted/30 rounded-md border"
                        style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", Roboto, Helvetica, Arial, sans-serif',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#24292f'
                        }}
                        dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
                    />
                )}
            </CardContent>
        </Card>
    )
}
