"use client";

import axios, { AxiosError } from "axios";
import React, { Fragment, useEffect } from "react";
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
import { Languages, Layers2, Link, Moon, Sun } from "lucide-react";
import useToggleTheme from "@/hooks/useToggleTheme";

const FormSchema = z.object({
  youtubeUrl: z.string().url(),
});

const SOURCE_LANGUAGE_AUTO = "auto";

const features = [
  {
    icon: <Link />,
    title: "Transcription",
    description: "10 mins of transcript",
  },
  {
    icon: <Languages />,
    title: "Translation",
    description: "5000 characters of transcript",
  },
  {
    icon: <Layers2 />,
    title: "Summarization",
    description: "5000 characters of transcript",
  },
];

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

  const { toggleTheme, isDarkMode } = useToggleTheme();

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

      const text = result.data.text;

      if (text) {
        setTransformedTranscript(text);
      }
    }
  };

  const handleSummarizeTexts = async () => {
    const text = transformedTranscript || transcribed;

    if (text) {
      const result = await summarizeTexts({ text });

      if (result.data) {
        setTransformedTranscript(result.data);
      }
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
      console.error(error);

      if (error instanceof AxiosError && error.response?.data) {
        return toast.error(error.response.data);
      }

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

  const renderFeatureCard = (
    icon: React.ReactNode,
    title: string,
    description: string
  ) => {
    return (
      <div className="flex flex-col md:flex-row max-w-xs w-full md:max-w-none flex-1 items-center gap-2 md:gap-4 rounded-md p-2 md:p-4 bg-foreground/5">
        <div className="bg-foreground/10 rounded-md p-2">{icon}</div>
        <div className=" text-center md:text-left">
          <div className="text-xs font-medium">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">2 credits per day</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-4 h-full flex flex-col items-center gap-8 justify-center">
      <Button onClick={toggleTheme} className="cursor-pointer">
        {isDarkMode ? <Moon /> : <Sun />}
      </Button>
      <div className="w-full flex justify-center text-center flex-col items-center">
        <h1 className="text-3xl font-bold">
          <span className="text-primary">YT</span> Transcribe
        </h1>
        <p className="text-sm text-muted-foreground">
          A simple YouTube video transcriber
        </p>
      </div>

      <div className="flex gap-4 items-center w-full max-w-4xl flex-col md:flex-row">
        {features.map((feature, index) => (
          <Fragment key={index}>
            {renderFeatureCard(
              feature.icon,
              feature.title,
              feature.description
            )}
          </Fragment>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-lg space-y-4 flex flex-col items-center"
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
        <div className="max-h-[700px] max-w-5xl w-full flex flex-col  md:p-4 gap-4 overflow-hidden">
          <div className="flex flex-wrap gap-4 justify-center md:justify-between">
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center">
              <Label>Translate</Label>
              <div className="flex gap-4 items-center">
                <Select
                  value={sourceLanguage}
                  onValueChange={setSourceLanguage}
                  disabled
                >
                  <SelectTrigger className="w-fit">
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
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger className="w-fit">
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
            className="w-full text-sm resize-none"
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
