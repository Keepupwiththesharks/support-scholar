import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedDocument {
  title?: string;
  description?: string;
  sections: string[];
}

// Common heading patterns to detect sections
const HEADING_PATTERNS = [
  /^#{1,3}\s+(.+)$/gm,           // Markdown headings
  /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi, // HTML headings
  /^([A-Z][A-Za-z\s]+):$/gm,     // Title: format
  /^\d+\.\s+([A-Z][A-Za-z\s]+)$/gm, // Numbered sections
];

// Common section labels to look for
const COMMON_SECTIONS = [
  'introduction', 'summary', 'overview', 'background', 'context',
  'details', 'description', 'analysis', 'findings', 'results',
  'conclusion', 'conclusions', 'recommendations', 'next steps',
  'action items', 'tasks', 'references', 'appendix', 'notes',
  'key points', 'highlights', 'methodology', 'discussion',
  'abstract', 'executive summary', 'table of contents',
];

async function fetchAndParseUrl(url: string): Promise<ParsedDocument> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RecapBot/1.0)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  
  const sections: string[] = [];
  let title: string | undefined;
  
  // Try to extract title
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  // Extract headings based on content type
  if (contentType.includes('html')) {
    // Parse HTML headings
    const h1Match = text.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && !title) {
      title = h1Match[1].trim();
    }
    
    // Get all h2 and h3 headings as sections
    const headingRegex = /<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi;
    let match;
    while ((match = headingRegex.exec(text)) !== null) {
      const heading = match[1].trim();
      if (heading.length > 2 && heading.length < 100) {
        sections.push(heading);
      }
    }
  } else {
    // Parse as plain text/markdown
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Markdown headings
      const mdMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
      if (mdMatch) {
        sections.push(mdMatch[1].trim());
        if (!title && trimmed.startsWith('# ')) {
          title = mdMatch[1].trim();
        }
        continue;
      }
      
      // Numbered sections like "1. Introduction"
      const numberedMatch = trimmed.match(/^\d+\.\s+([A-Z][A-Za-z\s]+)$/);
      if (numberedMatch) {
        sections.push(numberedMatch[1].trim());
        continue;
      }
      
      // Title: format
      const colonMatch = trimmed.match(/^([A-Z][A-Za-z\s]{2,30}):$/);
      if (colonMatch) {
        sections.push(colonMatch[1].trim());
      }
    }
  }
  
  // If we couldn't find sections, look for common section keywords
  if (sections.length === 0) {
    const lowerText = text.toLowerCase();
    for (const section of COMMON_SECTIONS) {
      if (lowerText.includes(section)) {
        const capitalized = section.split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        if (!sections.includes(capitalized)) {
          sections.push(capitalized);
        }
      }
    }
  }
  
  // Remove duplicates and limit to 15 sections
  const uniqueSections = [...new Set(sections)].slice(0, 15);
  
  return {
    title: title?.slice(0, 100),
    description: `Template extracted from ${new URL(url).hostname}`,
    sections: uniqueSections.length > 0 ? uniqueSections : [
      'Introduction',
      'Main Content', 
      'Key Points',
      'Conclusion',
    ],
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    let result: ParsedDocument;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('No file provided');
      }
      
      const text = await file.text();
      
      // Parse based on file type
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        result = {
          title: parsed.name || parsed.title,
          description: parsed.description,
          sections: Array.isArray(parsed.sections) 
            ? parsed.sections.map((s: string | { label: string }) => 
                typeof s === 'string' ? s : s.label
              )
            : ['Section 1', 'Section 2', 'Section 3'],
        };
      } else {
        // Plain text - extract headings
        const sections: string[] = [];
        const lines = text.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          // Look for markdown headings
          const mdMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
          if (mdMatch) {
            sections.push(mdMatch[1].trim());
            continue;
          }
          
          // Look for all-caps headings
          if (trimmed.length > 3 && trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /^[A-Z\s]+$/.test(trimmed)) {
            sections.push(trimmed.charAt(0) + trimmed.slice(1).toLowerCase());
          }
        }
        
        result = {
          title: file.name.replace(/\.[^.]+$/, ''),
          sections: sections.length > 0 ? sections : ['Section 1', 'Section 2', 'Section 3'],
        };
      }
    } else {
      // Handle JSON body with URL
      const { url } = await req.json();
      
      if (!url || typeof url !== 'string') {
        throw new Error('URL is required');
      }
      
      result = await fetchAndParseUrl(url);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error parsing document:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        sections: ['Introduction', 'Main Content', 'Conclusion'],
      }),
      { 
        status: 200, // Return 200 with fallback sections
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
