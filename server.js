// server.js
import express from 'express';
import { generateJSON, generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Tiptap extensions configuration
const extensions = [
  StarterKit,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer nofollow ugc',
    },
  }),
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight,
];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HTML to ProseMirror API',
    endpoints: {
      '/convert': 'POST - Convert HTML to ProseMirror JSON',
      '/convert/escaped': 'POST - Convert HTML to escaped ProseMirror JSON string',
      '/reverse': 'POST - Convert ProseMirror JSON back to HTML',
    }
  });
});

// Convert HTML to ProseMirror JSON
app.post('/convert', (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({
        error: 'Missing required field: html'
      });
    }

    const json = generateJSON(html, extensions);

    res.json({
      success: true,
      data: json
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert HTML to ProseMirror',
      message: error.message
    });
  }
});

// Convert HTML to escaped ProseMirror JSON string (like your format)
app.post('/convert/escaped', (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({
        error: 'Missing required field: html'
      });
    }

    const json = generateJSON(html, extensions);
    
    // Wrap in version and document structure
    const wrappedJson = {
      version: '1',
      document: json
    };

    // Convert to escaped JSON string
    const escapedJson = JSON.stringify(wrappedJson);

    res.json({
      success: true,
      data: escapedJson
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert HTML to ProseMirror',
      message: error.message
    });
  }
});

// Convert ProseMirror JSON back to HTML
app.post('/reverse', (req, res) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({
        error: 'Missing required field: json'
      });
    }

    // If json is a string, parse it first
    const parsedJson = typeof json === 'string' ? JSON.parse(json) : json;
    
    // Handle wrapped format with version and document
    const content = parsedJson.document || parsedJson;

    const html = generateHTML(content, extensions);

    res.json({
      success: true,
      data: html
    });
  } catch (error) {
    console.error('Reverse conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert ProseMirror to HTML',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HTML to ProseMirror API running on port ${PORT}`);
  console.log(`Test it: curl -X POST http://localhost:${PORT}/convert -H "Content-Type: application/json" -d '{"html":"<p>Hello <strong>world</strong></p>"}'`);
});