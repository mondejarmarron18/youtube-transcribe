"use client";

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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import React from "react";

const FormSchema = z.object({
  youtubeUrl: z.string().url(),
});

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
    setTranscribed("");

    form.reset();
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
                <FormDescription>
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
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" className="cursor-pointer">
                Summarize
              </Button>
              <Button variant="outline" className="cursor-pointer">
                Translate
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer self-end"
                onClick={handleCopy}
              >
                Copy
              </Button>
            </div>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
          <div className="w-full h-full whitespace-pre-wrap overflow-y-auto">
            {transcribed}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
