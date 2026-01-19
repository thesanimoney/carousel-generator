import { useFormContext } from "react-hook-form";

import { DocumentFormReturn } from "@/lib/document-form-types";
import { Loader2Icon } from "lucide-react";
import React, { useState } from "react";
import { JsonExporter } from "./json-exporter";
import { JsonImporter } from "./json-importer";
import { FilenameForm } from "./forms/filename-form";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileInputForm from "./forms/file-input-form";
import { useFieldsFileImporter } from "@/lib/hooks/use-fields-file-importer";
import { usePagerContext } from "@/lib/providers/pager-context";
import { defaultValues } from "@/lib/default-document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

function ImportDialogContent({
  field,
  handleFileSubmission,
  handleJsonPaste,
  onClose,
}: {
  field: "config" | "slides";
  handleFileSubmission: (files: FileList) => void;
  handleJsonPaste: (json: any) => void;
  onClose: () => void;
}) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  return (
    <Tabs defaultValue="paste" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="paste">Paste JSON</TabsTrigger>
        <TabsTrigger value="file">Upload File</TabsTrigger>
        
      </TabsList>
      <TabsContent value="file" className="space-y-4">
        <FileInputForm
          handleSubmit={(files) => {
            handleFileSubmission(files);
            onClose();
          }}
          label={field === "config" ? "Settings File" : "Content File"}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handlePasteSubmit} className="w-full">
            Import JSON
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function EditorMenubar({}: {}) {
  const { reset, watch }: DocumentFormReturn = useFormContext(); // retrieve those props
  const { setCurrentPage } = usePagerContext();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const {
    handleFileSubmission: handleConfigFileSubmission,
    handleJsonPaste: handleConfigJsonPaste,
  } = useFieldsFileImporter("config");
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  const {
    handleFileSubmission: handleContentFileSubmission,
    handleJsonPaste: handleContentJsonPaste,
  } = useFieldsFileImporter("slides");

  return (
    // TODO: Add Here download and help
    <div className="flex items-center flex-row gap-2">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            {/* <MenubarItem > */}
            <FilenameForm className={"text-left my-1"} />
            {/* </MenubarItem> */}
            <MenubarSeparator />
            <JsonExporter
              values={watch("config")}
              filename={"carousel-settings.json"}
            >
              <MenubarItem>Export Settings</MenubarItem>
            </JsonExporter>
            <Dialog
              open={isConfigDialogOpen}
              onOpenChange={setIsConfigDialogOpen}
            >
              <DialogTrigger asChild>
                <MenubarItem onSelect={(e) => e.preventDefault()}>
                  Import Settings
                </MenubarItem>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Load Settings</DialogTitle>
                </DialogHeader>
                <ImportDialogContent
                  field="config"
                  handleFileSubmission={handleConfigFileSubmission}
                  handleJsonPaste={(json) => {
                    handleConfigJsonPaste(json);
                    setIsConfigDialogOpen(false);
                  }}
                  onClose={() => setIsConfigDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <MenubarSeparator />
            <JsonExporter
              values={watch("slides")}
              filename={"carousel-content.json"}
            >
              <MenubarItem>Export Content</MenubarItem>
            </JsonExporter>
            <Dialog
              open={isContentDialogOpen}
              onOpenChange={setIsContentDialogOpen}
            >
              <DialogTrigger asChild>
                <MenubarItem onSelect={(e) => e.preventDefault()}>
                  Import Content
                </MenubarItem>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Load Content</DialogTitle>
                </DialogHeader>
                <ImportDialogContent
                  field="slides"
                  handleFileSubmission={handleContentFileSubmission}
                  handleJsonPaste={(json) => {
                    handleContentJsonPaste(json);
                    setIsContentDialogOpen(false);
                  }}
                  onClose={() => setIsContentDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <MenubarSeparator />

            <MenubarItem
              onClick={() => {
                reset(defaultValues);
                setCurrentPage(0);
              }}
            >
              {/* TODO: This should have a confirmation alert dialog */}
              Reset to defaults
            </MenubarItem>
            {/* <MenubarSeparator /> */}
            {/* <MenubarItem>Print</MenubarItem> */}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
