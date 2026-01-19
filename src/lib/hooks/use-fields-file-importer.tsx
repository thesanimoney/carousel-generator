import { DocumentFormReturn } from "@/lib/document-form-types";
import { useEffect, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ConfigSchema } from "@/lib/validation/document-schema";
import { MultiSlideSchema, UnstyledMultiSlideSchema, CommonSlideSchema } from "@/lib/validation/slide-schema";
import { DEFAULT_BACKGROUND_IMAGE_INPUT } from "@/lib/validation/image-schema";
import merge from "deepmerge";
import { getDefaultSlideOfType } from "@/lib/default-slides";

export function useFieldsFileImporter(field: "config" | "slides") {
  const form: DocumentFormReturn = useFormContext(); // retrieve those props
  const { setValue, reset, getValues, control } = form;
  
  // Use field array for slides to get replace method
  const slidesFieldArray = useFieldArray({
    control,
    name: "slides",
  });
  const [fileReader, setFileReader] = useState<FileReader | null>(null);
  const [fileReaderIsConfigured, setFileReaderIsConfigured] = useState(false);

  useEffect(() => {
    setFileReader(new FileReader());
  }, []);

  if (fileReader && !fileReaderIsConfigured) {
    setFileReaderIsConfigured(true);
    fileReader.onload = function (e: ProgressEvent) {
      if (!e.target) {
        console.error("Failed to load file input");
        return;
      }

      // @ts-ignore file has result
      const result = JSON.parse(e.target.result);
      // Validate input and add to form
      if (field == "config") {
        const parsedValues = ConfigSchema.parse(result);
        if (parsedValues) {
          setValue(field, parsedValues);
        }
      } else if (field == "slides") {
        // Try to parse as unstyled first (for import compatibility)
        const unstyledResult = UnstyledMultiSlideSchema.safeParse(result);
        
        if (unstyledResult.success) {
          // Convert unstyled slides to styled slides
          // Log which slides are being filtered out
          const filteredOut = unstyledResult.data.filter((slide, idx) => {
            return !slide.elements || slide.elements.length === 0;
          });
          if (filteredOut.length > 0) {
            console.warn(`Filtered out ${filteredOut.length} slide(s) with empty elements:`, filteredOut);
          }
          
          const styledSlides = unstyledResult.data
            .filter((unstyledSlide) => {
              return unstyledSlide.elements && unstyledSlide.elements.length > 0;
            })
            .map((unstyledSlide, idx) => {
              try {
                return CommonSlideSchema.parse({
                  elements: unstyledSlide.elements,
                  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
                });
              } catch (error) {
                console.error(`Error parsing slide ${idx}:`, error, unstyledSlide);
                throw error;
              }
            });
          console.log({ 
            importedSlidesCount: styledSlides.length, 
            originalCount: unstyledResult.data.length,
            filteredCount: filteredOut.length,
            beforeReplace: getValues(field)?.length || 0
          });
        
        // Use field array's replace method to replace all slides at once
        slidesFieldArray.replace(styledSlides);
        
        // Force trim to exact expected count - remove any extra slides from the end
        const expectedCount = styledSlides.length;
        setTimeout(() => {
          let afterReplace = getValues(field)?.length || 0;
          let fieldArrayLength = slidesFieldArray.fields.length;
          
          // Remove slides until we match the expected count
          while (slidesFieldArray.fields.length > expectedCount) {
            slidesFieldArray.remove(slidesFieldArray.fields.length - 1);
          }
          
          // Double-check after removal
          afterReplace = getValues(field)?.length || 0;
          fieldArrayLength = slidesFieldArray.fields.length;
          
          console.log({ 
            afterReplace, 
            fieldArrayLength,
            expected: expectedCount,
            match: afterReplace === expectedCount && fieldArrayLength === expectedCount
          });
        }, 150);
        } else {
          // Try parsing as styled slides (with backgroundImage)
          const parsedValues = MultiSlideSchema.parse(result);
          if (parsedValues) {
            // Filter out slides with empty elements
            const validSlides = parsedValues.filter((slide: any) => {
              return slide.elements && Array.isArray(slide.elements) && slide.elements.length > 0;
            });
            console.log({ 
              importedSlidesCount: validSlides.length, 
              beforeReplace: getValues(field)?.length || 0
            });
            
            // Use field array's replace method to replace all slides at once
            slidesFieldArray.replace(validSlides);
            
            // Force trim to exact expected count
            const expectedCount = validSlides.length;
            setTimeout(() => {
              // Remove slides until we match the expected count
              while (slidesFieldArray.fields.length > expectedCount) {
                slidesFieldArray.remove(slidesFieldArray.fields.length - 1);
              }
              
              const afterReplace = getValues(field)?.length || 0;
              const fieldArrayLength = slidesFieldArray.fields.length;
              console.log({ 
                afterReplace, 
                fieldArrayLength,
                expected: expectedCount,
                match: afterReplace === expectedCount && fieldArrayLength === expectedCount
              });
            }, 150);
          }
        }
      } else {
        console.error("field provided is incorrect");
      }
    };
  }

  const handleFileSubmission = (files: FileList) => {
    if (files && files.length > 0) {
      if (fileReader) {
        fileReader.readAsText(files[0]);
      }
    }

    // setOpen(false);
  };

  const handleJsonPaste = (parsedJson: any) => {
    // Validate input and add to form
    if (field == "config") {
      const parsedValues = ConfigSchema.parse(parsedJson);
      if (parsedValues) {
        setValue(field, parsedValues);
      }
    } else if (field == "slides") {
      // Try to parse as unstyled first (for import compatibility)
      const unstyledResult = UnstyledMultiSlideSchema.safeParse(parsedJson);
      
      if (unstyledResult.success) {
        // Convert unstyled slides to styled slides
        // Log which slides are being filtered out
        const filteredOut = unstyledResult.data.filter((slide, idx) => {
          return !slide.elements || slide.elements.length === 0;
        });
        if (filteredOut.length > 0) {
          console.warn(`Filtered out ${filteredOut.length} slide(s) with empty elements:`, filteredOut);
        }
        
        const styledSlides = unstyledResult.data
          .filter((unstyledSlide) => {
            return unstyledSlide.elements && unstyledSlide.elements.length > 0;
          })
          .map((unstyledSlide, idx) => {
            try {
              return CommonSlideSchema.parse({
                elements: unstyledSlide.elements,
                backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
              });
            } catch (error) {
              console.error(`Error parsing slide ${idx}:`, error, unstyledSlide);
              throw error;
            }
          });
        console.log({ 
          importedSlidesCount: styledSlides.length, 
          originalCount: unstyledResult.data.length,
          filteredCount: filteredOut.length,
          beforeReplace: getValues(field)?.length || 0,
          slidesToImport: styledSlides.map((s, i) => ({ 
            index: i, 
            elementCount: s.elements?.length || 0 
          }))
        });
        
          // Use field array's replace method to replace all slides at once
          slidesFieldArray.replace(styledSlides);
          
          // Force trim to exact expected count - remove any extra slides from the end
          const expectedCount = styledSlides.length;
          setTimeout(() => {
            // Remove slides until we match the expected count
            while (slidesFieldArray.fields.length > expectedCount) {
              slidesFieldArray.remove(slidesFieldArray.fields.length - 1);
            }
            
            const afterReplace = getValues(field)?.length || 0;
            const fieldArrayLength = slidesFieldArray.fields.length;
            console.log({ 
              afterReplace, 
              fieldArrayLength,
              expected: expectedCount,
              match: afterReplace === expectedCount && fieldArrayLength === expectedCount
            });
          }, 150);
      } else {
        // Try parsing as styled slides (with backgroundImage)
        const parsedValues = MultiSlideSchema.parse(parsedJson);
        if (parsedValues) {
          // Filter out slides with empty elements
          const validSlides = parsedValues.filter((slide: any) => {
            return slide.elements && Array.isArray(slide.elements) && slide.elements.length > 0;
          });
          console.log({ 
            importedSlidesCount: validSlides.length, 
            validSlides,
            beforeReplace: getValues(field)?.length || 0
          });
          // Use field array's replace method to replace all slides at once
          slidesFieldArray.replace(validSlides);
          
          // Force trim to exact expected count
          const expectedCount = validSlides.length;
          setTimeout(() => {
            // Remove slides until we match the expected count
            while (slidesFieldArray.fields.length > expectedCount) {
              slidesFieldArray.remove(slidesFieldArray.fields.length - 1);
            }
          }, 150);
        }
      }
    } else {
      console.error("field provided is incorrect");
    }
  };

  return { handleFileSubmission, handleJsonPaste };
}
