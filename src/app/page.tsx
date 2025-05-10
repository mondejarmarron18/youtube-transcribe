"use client";

import axios from "axios";
import React, { useMemo } from "react";
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
import { translateApi } from "@/utils/api";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";

const FormSchema = z.object({
  youtubeUrl: z.string().url(),
});

interface Language {
  code: string;
  name: string;
  targets: string[];
}

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
  const [language, setLanguage] = React.useState("");
  const [targetLanguage, setTargetLanguage] = React.useState("");
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [transformedTranscript, setTransformedTranscript] = React.useState("");
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    if (!transcribed) return;

    detectLanguage();
  }, [transcribed]);

  React.useEffect(() => {
    getTranslationLanguages();
  }, []);

  React.useEffect(() => {
    if (!language || !targetLanguage) return;

    handleTranslate(language, targetLanguage);
  }, [language, targetLanguage]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const res = await axios.post("/api/transcriptions", {
        data: values,
      });

      setTranscribed(res.data);

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
    navigator.clipboard.writeText(transcribed);
    toast.success("Copied to clipboard");
  };

  const handleReset = () => {
    setTransformedTranscript("");
    detectLanguage();
  };

  const handleSummarize = async () => {
    setStatus("Summarizing...");

    try {
      const res = await axios.post("/api/summarizations", {
        data: {
          text: transformedTranscript || transcribed,
        },
      });

      setTransformedTranscript(res.data);
    } catch (error) {
      console.error(error);

      toast.error("Summarization failed");
    }

    setStatus("");
  };

  const handleTranslate = async (source: string, target: string) => {
    setStatus("Translating...");
    try {
      const formData = new FormData();

      formData.append("q", transcribed);
      formData.append("source", source);
      formData.append("target", target);

      const translation = await translateApi.post("/translate", formData);

      setTransformedTranscript(translation.data.translatedText);
    } catch (error) {
      console.error(error);

      toast.error("Translation failed");
    }

    setStatus("");
  };

  const getTranslationLanguages = async () => {
    try {
      const result = await translateApi.get("/languages");

      setLanguages(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch translation languages");
    }
  };

  const detectLanguage = async () => {
    try {
      const formData = new FormData();

      formData.append("q", transcribed);

      const { data } = await translateApi.post("/detect", formData);

      if (data.length > 0) {
        return setLanguage(data[0].language);
      }

      toast.error("Language detection failed");
    } catch (error) {
      console.error(error);
      toast.error("Language detection failed");
    }
  };

  const currentLanguages = useMemo(() => {
    return languages.filter((lang) => lang.targets.includes(language));
  }, [language, languages]);

  const currentLanguage = useMemo(() => {
    return languages.find((lang) => lang.code === language);
  }, [language, languages]);

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
        <div className="max-h-[500px] w-full flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <Label>Translate</Label>
              {/* <Select
                key={language}
                defaultValue={language}
                onValueChange={setLanguage}
                disabled
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Translate From" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              <Select value="auto" disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Translate To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="auto" value="auto">
                    Auto ({currentLanguage?.name})
                  </SelectItem>
                </SelectContent>
              </Select>
              <Label>to</Label>
              <Select onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Translate To" />
                </SelectTrigger>
                <SelectContent>
                  {currentLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={handleSummarize}
              >
                Summarize
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer self-end"
                onClick={handleCopy}
              >
                Copy
              </Button>
              <Button
                variant="destructive"
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
            className="w-full whitespace-pre-wrap"
          />
        </div>
      )}

      {!!status && (
        <div className="w-full text-xl gap-2 flex justify-center items-center flex-col h-full fixed top-0 left-0 bg-background/30 backdrop-blur-xs">
          <span className="animate-spin text-2xl">⏳</span>
          <div className="animate-pulse text-center uppercase">{status}</div>
        </div>
      )}
    </div>
  );
};

export default Home;
