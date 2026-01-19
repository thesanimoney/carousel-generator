# Caroseul JSON Structure Guide

This guide explains how to structure JSON files for importing content and settings into Caroseul.

## Table of Contents

1. [Content JSON (Slides)](#content-json-slides)
2. [Settings JSON (Config)](#settings-json-config)
3. [Complete Document Structure](#complete-document-structure)
4. [Examples](#examples)

---

## Content JSON (Slides)

The **Content JSON** contains the slide content. This is what you import via **File → Import Content → Paste JSON**.

### Structure

```json
[
  {
    "elements": [
      {
        "type": "Title",
        "text": "Your title text here"
      },
      {
        "type": "Subtitle",
        "text": "Your subtitle text here"
      },
      {
        "type": "Description",
        "text": "Your description text here"
      }
    ]
  }
]
```

### Slide Structure

Each slide is an object with:

- **`elements`** (array, required, max 3 elements): Array of text elements for the slide

### Element Types

Elements can be one of three types:

#### 1. Title

```json
{
  "type": "Title",
  "text": "Your title (max 160 characters)"
}
```

#### 2. Subtitle

```json
{
  "type": "Subtitle",
  "text": "Your subtitle (max 160 characters)"
}
```

#### 3. Description

```json
{
  "type": "Description",
  "text": "Your description text (recommended < 240 characters)"
}
```

### Rules

- Each slide can have **maximum 3 elements**
- Each slide must have at least 1 element
- Title and Subtitle are limited to **160 characters** each
- Description should be under **240 characters** for best display

---

## Settings JSON (Config)

The **Settings JSON** contains brand, theme, fonts, and page number settings. This is what you import via **File → Import Settings → Paste JSON**.

### Structure

```json
{
  "brand": {
    "avatar": {
      "type": "Image",
      "source": {
        "src": "/avatar.jpg",
        "type": "URL"
      },
      "style": {
        "opacity": 100
      }
    },
    "name": "Your Name (max 30 chars)",
    "handle": "Your handle or tagline"
  },
  "theme": {
    "isCustom": false,
    "pallette": "black",
    "primary": "#0d0d0d",
    "secondary": "#161616",
    "background": "#ffffff"
  },
  "fonts": {
    "font1": "DM_Serif_Display",
    "font2": "DM_Sans"
  },
  "pageNumber": {
    "showNumbers": true
  }
}
```

### Brand Settings

```json
{
  "brand": {
    "avatar": {
      "type": "Image",
      "source": {
        "src": "/avatar.jpg",  // Path to image (URL or relative path)
        "type": "URL"           // One of: "URL", "UPLOAD", "GENERATED"
      },
      "style": {
        "opacity": 100          // Number between 0-100
      }
    },
    "name": "Your Name",        // Max 30 characters
    "handle": "Your tagline"    // No limit
  }
}
```

### Theme Settings

```json
{
  "theme": {
    "isCustom": false,          // boolean
    "pallette": "black",        // Palette name (string)
    "primary": "#0d0d0d",       // Hex color (7 characters: #RRGGBB)
    "secondary": "#161616",     // Hex color
    "background": "#ffffff"     // Hex color
  }
}
```

### Fonts Settings

Available fonts:
- `DM_Serif_Display`
- `DM_Sans`
- `PT_Serif`
- `Roboto`
- `Roboto_Condensed`
- `Ultra`

```json
{
  "fonts": {
    "font1": "DM_Serif_Display",  // Primary font (typically for titles)
    "font2": "DM_Sans"            // Secondary font (typically for body text)
  }
}
```

### Page Number Settings

```json
{
  "pageNumber": {
    "showNumbers": true  // boolean - show/hide page numbers
  }
}
```

---

## Complete Document Structure

The complete document structure includes both slides and config:

```json
{
  "slides": [...],      // Array of slides (see Content JSON above)
  "config": {...},      // Settings object (see Settings JSON above)
  "filename": "My Carousel File"
}
```

**Note:** When importing, you typically import `slides` and `config` separately using the respective import dialogs.

---

## Examples

### Example 1: Simple Content JSON (Import Content)

```json
[
  {
    "elements": [
      {
        "type": "Title",
        "text": "Welcome to My Presentation"
      },
      {
        "type": "Description",
        "text": "This is a brief introduction to what we'll be covering today."
      }
    ]
  },
  {
    "elements": [
      {
        "type": "Title",
        "text": "Key Points"
      },
      {
        "type": "Subtitle",
        "text": "What you need to know"
      },
      {
        "type": "Description",
        "text": "First point: This is important. Second point: Also important."
      }
    ]
  }
]
```

### Example 2: Full Content JSON with Multiple Slides

```json
[
  {
    "elements": [
      {
        "type": "Title",
        "text": "🚀 Project Management Best Practices"
      },
      {
        "type": "Subtitle",
        "text": "Essential strategies for success"
      }
    ]
  },
  {
    "elements": [
      {
        "type": "Title",
        "text": "Clear Communication"
      },
      {
        "type": "Description",
        "text": "Maintain open channels with your team and stakeholders. Regular updates prevent misunderstandings."
      }
    ]
  },
  {
    "elements": [
      {
        "type": "Title",
        "text": "Set Realistic Goals"
      },
      {
        "type": "Description",
        "text": "Break down large projects into manageable milestones. Celebrate small wins along the way."
      }
    ]
  }
]
```

### Example 3: Settings JSON (Import Settings)

```json
{
  "brand": {
    "avatar": {
      "type": "Image",
      "source": {
        "src": "/avatar.jpg",
        "type": "URL"
      },
      "style": {
        "opacity": 100
      }
    },
    "name": "John Doe",
    "handle": "Product Manager & Designer"
  },
  "theme": {
    "isCustom": false,
    "pallette": "black",
    "primary": "#0d0d0d",
    "secondary": "#161616",
    "background": "#ffffff"
  },
  "fonts": {
    "font1": "DM_Serif_Display",
    "font2": "DM_Sans"
  },
  "pageNumber": {
    "showNumbers": true
  }
}
```

### Example 4: Minimal Content JSON (Stripped Down)

This is the format you get when exporting content:

```json
[
  {
    "elements": [
      {
        "type": "Title",
        "text": "Project Management Is Not About Gantt Charts",
        "style": {
          "fontSize": "Medium",
          "align": "Center"
        }
      },
      {
        "type": "Description",
        "text": "Real project management is about ownership, clarity, and decision-making.",
        "style": {
          "fontSize": "Medium",
          "align": "Center"
        }
      }
    ]
  }
]
```

**Note:** When importing via Paste JSON, the `style` properties are optional. If omitted, default styles will be applied:
- `fontSize`: `"Medium"` (options: `"Small"`, `"Medium"`, `"Large"`)
- `align`: `"Left"` (options: `"Left"`, `"Center"`, `"Right"`)

---

## Import Process

1. **Content Import:**
   - Go to **File → Import Content**
   - Switch to **"Paste JSON"** tab (default)
   - Paste your slides JSON array
   - Click **"Import JSON"**

2. **Settings Import:**
   - Go to **File → Import Settings**
   - Switch to **"Paste JSON"** tab (default)
   - Paste your config JSON object
   - Click **"Import JSON"**

---

## Validation Rules

### Content JSON Validation

- Must be a valid JSON array
- Each slide must have an `elements` array
- Maximum 3 elements per slide
- Element types must be: `"Title"`, `"Subtitle"`, or `"Description"`
- Title and Subtitle text max 160 characters

### Settings JSON Validation

- Must be a valid JSON object
- `brand.name` max 30 characters
- `theme.primary`, `theme.secondary`, `theme.background` must be valid hex colors (7 characters: `#RRGGBB`)
- `avatar.style.opacity` must be between 0-100
- Font names must match available fonts

---

## Tips

1. **Keep text concise:** Titles and subtitles work best when under 100 characters
2. **Use emojis:** You can include emojis in text content for visual appeal
3. **Test in chunks:** Start with 1-2 slides to verify your JSON structure works
4. **Validate JSON:** Use a JSON validator before pasting to catch syntax errors
5. **Export first:** If unsure about structure, export existing content first to see the format

---

## Troubleshooting

### Common Errors

**"Invalid JSON format"**
- Check for trailing commas
- Ensure all strings are properly quoted
- Validate your JSON using a JSON validator

**"Schema validation failed"**
- Check element types are exactly: `"Title"`, `"Subtitle"`, or `"Description"`
- Verify text length limits (Title/Subtitle: 160 chars max)
- Ensure colors are valid hex format: `#RRGGBB`

**"Element count exceeded"**
- Each slide can have maximum 3 elements
- Split content across multiple slides if needed

---

## Need Help?

If you encounter issues:
1. Validate your JSON using an online JSON validator
2. Check the examples above for correct structure
3. Export existing content to see the exact format expected
4. Ensure you're importing to the correct dialog (Content vs Settings)
