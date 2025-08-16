import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    // Since we now receive clean markdown from the frontend, no need for complex cleaning
    // Just trim and use as-is
    const cleanMarkdown = markdown.trim();

    // Configure marked with better options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Convert cleaned markdown to HTML
    const html = await marked(cleanMarkdown);

    // Create a complete HTML document with VS Code/Obsidian-like styles
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #24292f;
            background: #ffffff;
            padding: 32px;
            max-width: 100%;
            word-wrap: break-word;
          }
          
          /* Headings */
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: #1f2328;
          }
          
          h1 {
            font-size: 2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #d8dee4;
          }
          
          h2 {
            font-size: 1.5em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #d8dee4;
          }
          
          h3 {
            font-size: 1.25em;
          }
          
          h4 {
            font-size: 1em;
          }
          
          h5 {
            font-size: 0.875em;
          }
          
          h6 {
            font-size: 0.85em;
            color: #656d76;
          }
          
          /* Paragraphs */
          p {
            margin-top: 0;
            margin-bottom: 16px;
          }
          
          /* Lists */
          ul, ol {
            margin-top: 0;
            margin-bottom: 16px;
            padding-left: 2em;
          }
          
          li {
            margin: 0.25em 0;
          }
          
          li > p {
            margin-top: 16px;
          }
          
          li + li {
            margin-top: 0.25em;
          }
          
          /* Blockquotes */
          blockquote {
            margin: 0 0 16px 0;
            padding: 0 1em;
            color: #656d76;
            border-left: 0.25em solid #d0d7de;
          }
          
          blockquote > :first-child {
            margin-top: 0;
          }
          
          blockquote > :last-child {
            margin-bottom: 0;
          }
          
          /* Code */
          code, tt {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            white-space: break-spaces;
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }
          
          pre {
            margin-top: 0;
            margin-bottom: 16px;
            word-wrap: normal;
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }
          
          pre code {
            display: inline;
            max-width: auto;
            padding: 0;
            margin: 0;
            overflow: visible;
            line-height: inherit;
            word-wrap: normal;
            background-color: transparent;
            border: 0;
          }
          
          /* Tables */
          table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 16px;
            width: 100%;
            overflow: auto;
          }
          
          table th {
            font-weight: 600;
            background-color: #f6f8fa;
          }
          
          table th, table td {
            padding: 6px 13px;
            border: 1px solid #d0d7de;
            text-align: left;
          }
          
          table tr {
            background-color: #ffffff;
            border-top: 1px solid #c6cbd1;
          }
          
          table tr:nth-child(2n) {
            background-color: #f6f8fa;
          }
          
          /* Links */
          a {
            color: #0969da;
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          /* Horizontal rules */
          hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #d0d7de;
            border: 0;
          }
          
          /* Strong and emphasis */
          strong, b {
            font-weight: 600;
          }
          
          em, i {
            font-style: italic;
          }
          
          /* Images */
          img {
            max-width: 100%;
            height: auto;
            box-sizing: content-box;
            background-color: #ffffff;
          }
          
          /* Task lists */
          .task-list-item {
            list-style-type: none;
          }
          
          .task-list-item-checkbox {
            margin: 0 0.2em 0.25em -1.4em;
            vertical-align: middle;
          }
          
          /* Print styles */
          @media print {
            body {
              padding: 20px;
            }
            
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
            }
            
            blockquote, pre, table {
              page-break-inside: avoid;
            }
            
            img {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    // Get (or launch) Puppeteer browser instance
    const browser = await getBrowser();

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2
    });

    // Set the HTML content
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with better options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });

    await browser.close();

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ropa-document.pdf"'
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
