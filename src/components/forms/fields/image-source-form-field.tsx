import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { convertFileToDataUrl } from "@/lib/convert-file";
import {
  DocumentFormReturn,
  ImageSourceFieldPath,
} from "@/lib/document-form-types";
import imageCompression from "browser-image-compression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ImageInputType } from "@/lib/validation/image-schema";
import { useEffect, useState, useRef, useCallback } from "react";
import { ClipboardPaste } from "lucide-react";

export const MAX_IMAGE_SIZE_MB = 0.5; // Set your maximum image size limit in megabytes
export const MAX_IMAGE_WIDTH = 800; // Set your maximum image width

export function ImageSourceFormField({
  fieldName,
  form,
}: {
  fieldName: ImageSourceFieldPath;
  form: DocumentFormReturn;
}) {
  const [tabValue, setTabValue] = useState(ImageInputType.Paste);
  const [isPasting, setIsPasting] = useState(false);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const imageType = form.getValues(`${fieldName}.type`);
  useEffect(() => {
    // Use effect is needed to have consistent rendering of same defaults state on server and client. Then the client sets its tab selection
    // Default to Paste if no type is set
    setTabValue(imageType || ImageInputType.Paste);
  }, [imageType]);

  // Handle clipboard paste
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement> | ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        setIsPasting(true);
        const file = item.getAsFile();
        if (file) {
          try {
            const compressedFile = await imageCompression(file, {
              maxSizeMB: MAX_IMAGE_SIZE_MB,
              maxWidthOrHeight: MAX_IMAGE_WIDTH,
            });
            const dataUrl = await convertFileToDataUrl(compressedFile);
            form.setValue(fieldName, {
              type: ImageInputType.Paste,
              src: dataUrl || "",
            });
          } catch (error) {
            console.error("Error processing pasted image:", error);
          } finally {
            setIsPasting(false);
          }
        }
        break;
      }
    }
  }, [fieldName, form]);

  // Set up paste event listener when Paste tab is active
  useEffect(() => {
    if (tabValue === ImageInputType.Paste) {
      const element = pasteAreaRef.current || document;
      const pasteHandler = (e: Event) => handlePaste(e as ClipboardEvent);
      element.addEventListener("paste", pasteHandler);
      return () => {
        element.removeEventListener("paste", pasteHandler);
      };
    }
  }, [tabValue, handlePaste]);

  return (
    <Tabs
      onValueChange={(tabValue) => {
        form.setValue(fieldName, { type: tabValue as ImageInputType, src: "" });
        setTabValue(tabValue as ImageInputType);
      }}
      value={tabValue}
      defaultValue={ImageInputType.Paste}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value={ImageInputType.Url}>URL</TabsTrigger>
        <TabsTrigger value={ImageInputType.Upload}>Upload</TabsTrigger>
        <TabsTrigger value={ImageInputType.Paste}>Paste</TabsTrigger>
      </TabsList>
      <TabsContent value={ImageInputType.Url}>
        <FormField
          control={form.control}
          name={`${fieldName}.src`}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>{""}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Url to an image"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TabsContent>
      <TabsContent value={ImageInputType.Upload}>
        <FormField
          control={form.control}
          name={`${fieldName}.src`}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>{""}</FormLabel>
                <FormControl>
                  <Input
                    accept=".jpg, .jpeg, .png, .svg, .webp"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target?.files ? e.target?.files[0] : null;

                      if (file) {
                        // Check image dimensions
                        // const image = new Image();
                        // image.src = URL.createObjectURL(file);
                        // await image.decode(); // Wait for image to load
                        // if (image.width > MAX_IMAGE_WIDTH) {
                        //   console.log(
                        //     `Image width exceeds the maximum limit of ${MAX_IMAGE_WIDTH} pixels.`
                        //   );
                        //   return;
                        // }
                        const compressedFile = await imageCompression(file, {
                          maxSizeMB: MAX_IMAGE_SIZE_MB,
                          maxWidthOrHeight: MAX_IMAGE_WIDTH,
                        });
                        const dataUrl = await convertFileToDataUrl(
                          compressedFile
                        );
                        field.onChange(dataUrl ? dataUrl : "");
                      } else {
                        console.error("No valid image file selected.");
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TabsContent>
      <TabsContent value={ImageInputType.Paste}>
        <FormField
          control={form.control}
          name={`${fieldName}.src`}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>{""}</FormLabel>
                <FormControl>
                  <div
                    ref={pasteAreaRef}
                    tabIndex={0}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 min-h-[120px] cursor-pointer hover:border-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    onPaste={handlePaste}
                    onClick={() => {
                      // Focus the div to enable paste
                      pasteAreaRef.current?.focus();
                    }}
                  >
                    {isPasting ? (
                      <div className="text-sm text-muted-foreground">
                        Processing image...
                      </div>
                    ) : field.value ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={field.value}
                          alt="Pasted"
                          className="max-w-full max-h-32 object-contain rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange("");
                            form.setValue(fieldName, {
                              type: ImageInputType.Paste,
                              src: "",
                            });
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <ClipboardPaste className="w-8 h-8 text-muted-foreground" />
                        <div className="text-sm font-medium">
                          Click here and paste (Ctrl+V / Cmd+V)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Take a screenshot and paste it here
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
