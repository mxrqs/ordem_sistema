import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFThumbnail {
  url: string;
  pageNumber: number;
}

/**
 * Generate a thumbnail for the first page of a PDF
 * @param pdfUrl - URL to the PDF file
 * @param width - Width of the thumbnail in pixels (default: 150)
 * @param height - Height of the thumbnail in pixels (default: 200)
 * @returns Promise<string> - Data URL of the thumbnail image
 */
export async function generatePDFThumbnail(
  pdfUrl: string,
  width: number = 150,
  height: number = 200
): Promise<string> {
  try {
    // Fetch the PDF document
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set up the canvas
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(width / viewport.width, height / viewport.height);
    const scaledViewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    // Render the page to the canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    } as any).promise;
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    // Return a placeholder if thumbnail generation fails
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="200"%3E%3Crect fill="%23f0f0f0" width="150" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E';
  }
}

/**
 * Generate thumbnails for multiple PDFs
 * @param pdfUrls - Array of PDF URLs
 * @param width - Width of thumbnails
 * @param height - Height of thumbnails
 * @returns Promise<string[]> - Array of thumbnail data URLs
 */
export async function generatePDFThumbnails(
  pdfUrls: string[],
  width: number = 150,
  height: number = 200
): Promise<string[]> {
  return Promise.all(
    pdfUrls.map(url => generatePDFThumbnail(url, width, height))
  );
}
