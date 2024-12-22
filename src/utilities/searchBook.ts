import axios from 'axios';

interface OpenLibraryISBNResponse {
  [key: string]: {
    title: string;
    authors?: Array<{ name: string }>;
    publish_date?: string;
    publishers?: string[];
    number_of_pages?: number;
    subjects?: string[];
    cover_i?: number;
    description?: string | { value: string };
  };
}

interface OpenLibrarySearchResponse {
  docs: Array<{
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    isbn?: string[];
    number_of_pages?: number;
    subject?: string[];
    cover_i?: number;
  }>;
}

export interface BookSearchResult {
  success: boolean;
  data?: {
    title: string;
    author: string;
    publishDate?: string;
    publisher?: string;
    isbn?: string;
    pages?: number;
    subjects?: string[];
    coverUrl?: string;
    description?: string;
  };
  error?: string;
}

class BookSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookSearchError';
  }
}

export const searchBookFromOCR = async (ocrText: string): Promise<BookSearchResult> => {
  if (!ocrText || typeof ocrText !== 'string') {
    return {
      success: false,
      error: 'Invalid OCR text provided'
    };
  }

  try {
    const { searchUrl, isIsbnSearch, searchIdentifier } = buildSearchUrl(ocrText);
    const response = await axios.get<OpenLibraryISBNResponse | OpenLibrarySearchResponse>(searchUrl);
    
    return isIsbnSearch 
      ? handleIsbnSearchResponse(response.data as OpenLibraryISBNResponse, searchIdentifier)
      : handleTextSearchResponse(response.data as OpenLibrarySearchResponse);

  } catch (error) {
    const errorMessage = error instanceof BookSearchError 
      ? error.message 
      : 'Error searching for book details';
    
    console.error('Book search error:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

const cleanIsbn = (isbn: string): string => {
  // Remove "ISBN" prefix (case insensitive), hyphens, spaces, and any other non-alphanumeric characters
  return isbn.replace(/^ISBN[-:\s]*/i, '')  // Remove ISBN prefix and any following separators
           .replace(/[-\s]/g, '')           // Remove remaining hyphens and spaces
           .trim();                         // Clean up any remaining whitespace
};

const buildSearchUrl = (ocrText: string): { 
  searchUrl: string; 
  isIsbnSearch: boolean; 
  searchIdentifier: string; 
} => {
  const cleanText = ocrText.replace(/\n/g, ' ').trim();
  
  // ISBN pattern supporting ISBN-10 and ISBN-13 formats
  const isbnPattern = /(?:ISBN(?:-1[03])?:?\s*)?(?=[0-9X]{10}|(?=(?:[0-9]+[-\s]){3})[-\s0-9X]{13}|97[89][0-9]{10}|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17})(?:97[89][-\s])?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]/i;
  const isbnMatch = cleanText.match(isbnPattern);

  if (isbnMatch) {
    const isbn = cleanIsbn(isbnMatch[0]);
    return {
      searchUrl: `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      isIsbnSearch: true,
      searchIdentifier: isbn
    };
  }

  // Use first 100 characters for text search, focusing on likely title text
  const searchQuery = encodeURIComponent(cleanText.substring(0, 100));
  return {
    searchUrl: `https://openlibrary.org/search.json?q=${searchQuery}`,
    isIsbnSearch: false,
    searchIdentifier: searchQuery
  };
};

const handleIsbnSearchResponse = (
  response: OpenLibraryISBNResponse, 
  isbn: string
): BookSearchResult => {
  const bookKey = `ISBN:${isbn}`;
  const bookData = response[bookKey];

  if (!bookData) {
    throw new BookSearchError(`Book not found with this ISBN: ${isbn}`);
  }

  return {
    success: true,
    data: {
      title: bookData.title,
      author: bookData.authors?.[0]?.name || 'Unknown',
      publishDate: bookData.publish_date,
      publisher: bookData.publishers?.[0],
      isbn,
      pages: bookData.number_of_pages,
      subjects: bookData.subjects,
      coverUrl: bookData.cover_i 
        ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg` 
        : undefined,
      description: typeof bookData.description === 'object'
        ? bookData.description.value
        : bookData.description
    }
  };
};

const handleTextSearchResponse = (
  response: OpenLibrarySearchResponse
): BookSearchResult => {
  if (!response.docs || response.docs.length === 0) {
    throw new BookSearchError('No books found matching the text');
  }

  const bestMatch = response.docs[0];
  
  return {
    success: true,
    data: {
      title: bestMatch.title,
      author: bestMatch.author_name?.[0] || 'Unknown',
      publishDate: bestMatch.first_publish_year?.toString(),
      publisher: bestMatch.publisher?.[0],
      isbn: bestMatch.isbn?.[0],
      pages: bestMatch.number_of_pages,
      subjects: bestMatch.subject,
      coverUrl: bestMatch.cover_i 
        ? `https://covers.openlibrary.org/b/id/${bestMatch.cover_i}-L.jpg` 
        : undefined,
      description: undefined // Search API doesn't return description
    }
  };
};

export default searchBookFromOCR;