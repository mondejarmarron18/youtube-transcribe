"use client";

import axios from "axios";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
// import Markdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useTargetLanguages from "@/hooks/useTargetLanguages";
import useSourceLanguages from "@/hooks/useSourceLanguages";
import useTranslateTexts from "@/hooks/useTranslateTexts";
import useSummarizeText from "@/hooks/useSummarizeText";

const FormSchema = z.object({
  youtubeUrl: z.string().url(),
});

const SOURCE_LANGUAGE_AUTO = "auto";

const Home = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });
  const [transcribed, setTranscribed] = React.useState("");
  const isLoading = form.formState.isSubmitting;
  const isValid = form.formState.isValid;
  const [targetLanguage, setTargetLanguage] = React.useState<string>();
  const [sourceLanguage, setSourceLanguage] =
    React.useState<string>(SOURCE_LANGUAGE_AUTO);

  const { data: targetLanguages } = useTargetLanguages();
  const { data: sourceLanguages } = useSourceLanguages();
  const { mutateAsync: translateTexts, isLoading: isTranslating } =
    useTranslateTexts();
  const { mutateAsync: summarizeTexts, isLoading: isSummarizing } =
    useSummarizeText();

  const [transformedTranscript, setTransformedTranscript] = React.useState("");

  useEffect(() => {
    handleTranslateTexts();
  }, [sourceLanguage, targetLanguage]);

  const handleTranslateTexts = async () => {
    const texts = transformedTranscript || transcribed;
    const isSourceDefault =
      sourceLanguage === SOURCE_LANGUAGE_AUTO || !sourceLanguage;

    if (targetLanguage && texts) {
      const result = await translateTexts({
        source: isSourceDefault ? null : sourceLanguage,
        target: targetLanguage,
        texts,
      });

      setTransformedTranscript(result.data.text);
    }
  };

  const handleSummarizeTexts = async () => {
    const text = transformedTranscript || transcribed;

    if (text) {
      const result = await summarizeTexts({ text });

      setTransformedTranscript(result.data);
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const res = await axios.post("/api/transcriptions", {
        data: values,
      });

      setTranscribed(res.data);

      setTransformedTranscript("");
      form.reset();

      toast.success("Transcript generated successfully", {
        description: new Date().toISOString(),
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transformedTranscript || transcribed);
    toast.success("Copied to clipboard");
  };

  const handleReset = () => {
    setTransformedTranscript("");
  };

  return (
    <div className="w-full p-4 h-full flex flex-col items-center gap-8 justify-center">
      <div className="w-1/3 flex flex-col items-center">
        <h1 className="text-3xl font-bold">
          <span className="text-primary">YT</span> Transcribe
        </h1>
        <p className="text-sm text-muted-foreground">
          A simple YouTube video transcriber
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-1/3 space-y-6 flex flex-col items-center"
        >
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col items-center">
                <FormControl>
                  <Input
                    placeholder="Enter YouTube URL"
                    {...field}
                    readOnly={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-center">
                  Make sure that you have a valid youTube URL
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-fit cursor-pointer space-x-2"
            disabled={!isValid || isLoading}
          >
            {isLoading && <span className="animate-spin">⌛</span>}
            Transcribe
          </Button>
        </form>
      </Form>

      {transcribed && (
        <div className="max-h-[700px] w-full flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <Label>Translate</Label>
              <Select
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
                disabled
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SOURCE_LANGUAGE_AUTO}>
                    Auto Detect
                  </SelectItem>
                  {sourceLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>to</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  {targetLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleSummarizeTexts}
              >
                Summarize
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer self-end"
                onClick={handleCopy}
              >
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleReset}
                disabled={
                  !transformedTranscript ||
                  transformedTranscript === transcribed
                }
              >
                Reset
              </Button>
            </div>
          </div>

          <Textarea
            value={transformedTranscript || transcribed}
            onChange={(e) => setTransformedTranscript(e.target.value)}
            className="w-full resize-none"
          />
          {/* <Tabs
            defaultValue="preview"
            className="w-full h-full p-2 bg-secondary rounded-md overflow-hidden"
          >
            <TabsList className="w-full">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent
              value="preview"
              className="p-2 whitespace-pre-wrap overflow-auto"
            >
              <Markdown remarkPlugins={[remarkGfm]}>
                {transformedTranscript || transcribed}
              </Markdown>
            </TabsContent>
            <TabsContent value="edit" className="overflow-auto h-full p-2">
              <Textarea
                value={transformedTranscript || transcribed}
                onChange={(e) => setTransformedTranscript(e.target.value)}
                className="w-full overflow-hidden dark:text-base p-0 dark:bg-transparent focus-visible:ring-0 resize-none border-none rounded-none"
              />
            </TabsContent>
          </Tabs> */}
        </div>
      )}

      {(isTranslating || isSummarizing) && (
        <div className="w-full text-xl gap-2 flex justify-center items-center flex-col h-full fixed top-0 left-0 bg-background/30 backdrop-blur-xs">
          <span className="animate-spin text-2xl">⏳</span>
          <div className="animate-pulse text-center uppercase">
            {isTranslating ? "Translating..." : "Summarizing..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
