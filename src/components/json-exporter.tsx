export function JsonExporter({
  values,
  filename,
  children,
}: {
  values: any;
  filename: string;
  children: React.ReactNode;
}) {
  // Transform slides to match import format (UnstyledSlideSchema)
  // Filter out slides with empty elements and remove backgroundImage
  const transformSlides = (slides: any[]) => {
    if (!Array.isArray(slides)) return values;
    
    const transformed = slides
      .map((slide, index) => {
        // Transform to unstyled format (only elements, no backgroundImage)
        if (!slide?.elements || !Array.isArray(slide.elements)) {
          return null;
        }
        
        const validElements = slide.elements
          .filter((element: any) => {
            // Filter out elements with empty or whitespace-only text
            if (!element?.text || typeof element.text !== 'string') {
              return false;
            }
            return element.text.trim().length > 0;
          })
          .map((element: any) => {
            // Remove style if it exists (for unstyled import format)
            const { type, text } = element;
            return { type, text };
          });
        
        // Only return slide if it has at least one valid element
        if (validElements.length === 0) {
          return null;
        }
        
        return {
          elements: validElements,
        };
      })
      .filter((slide) => {
        // Remove null entries (invalid/empty slides)
        return slide !== null;
      });
    
    // Additional safety: remove trailing empty slides
    // Remove from the end until we find a slide with content
    while (transformed.length > 0) {
      const lastSlide = transformed[transformed.length - 1];
      const lastSlideHasContent = lastSlide?.elements && 
        lastSlide.elements.length > 0 &&
        lastSlide.elements.some((el: any) => {
          return el?.text && typeof el.text === 'string' && el.text.trim().length > 0;
        });
      
      if (!lastSlideHasContent) {
        transformed.pop();
      } else {
        break;
      }
    }
    
    return transformed;
  };

  // Check if this is slides export (array of slides)
  const isSlidesExport = Array.isArray(values) && values.length > 0 && values[0]?.elements;
  
  let exportData = isSlidesExport ? transformSlides(values) : values;
  
  // Log export info for debugging
  if (isSlidesExport) {
    console.log('Export:', {
      originalCount: Array.isArray(values) ? values.length : 0,
      exportedCount: Array.isArray(exportData) ? exportData.length : 0,
      lastSlideEmpty: Array.isArray(exportData) && exportData.length > 0 
        ? (exportData[exportData.length - 1]?.elements?.length === 0 || 
           !exportData[exportData.length - 1]?.elements?.some((el: any) => el?.text?.trim()))
        : false
    });
  }

  return (
    <a
      href={`data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 4)
      )}`}
      download={filename}
    >
      {children}
    </a>
  );
}
