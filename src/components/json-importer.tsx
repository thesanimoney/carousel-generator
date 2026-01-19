import { DocumentFormReturn } from "@/lib/document-form-types";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./ui/input";
import { ConfigSchema } from "@/lib/validation/document-schema";
import { MultiSlideSchema } from "@/lib/validation/slide-schema";
import FileInputForm from "./forms/file-input-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useFieldsFileImporter } from "@/lib/hooks/use-fields-file-importer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function JsonImporter({
  fields,
  children,
}: {
  fields: "config" | "slides";
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { handleFileSubmission, handleJsonPaste } = useFieldsFileImporter(fields);
  // TODO: Make this component more generic by splitting dependencies of config and slides

  const handlePasteSubmit = () => {
    if (!jsonText.trim()) {
      setError("Please paste some JSON content");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      handleJsonPaste(parsed);
      setError(null);
      setJsonText("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <button>Open</button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load {fields === "config" ? "Settings" : "Content"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="space-y-4">
            <FileInputForm
              handleSubmit={(files) => {
                handleFileSubmission(files);
                setOpen(false);
              }}
              label={"Input File"}
              description="Select a json file to load"
            />
          </TabsContent>
          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste JSON Content</label>
              <Textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError(null);
                }}
                placeholder="Paste your JSON content here..."
                className="min-h-[300px] font-mono text-sm"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button onClick={handlePasteSubmit} className="w-full">
                Import JSON
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
