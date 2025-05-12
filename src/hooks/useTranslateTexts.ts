import axios from "axios";
import { Language } from "deepl-node";
import React from "react";
import { toast } from "sonner";

interface TranslateTextsDTO {
  texts: string | string[];
  source: string | null;
  target: string;
}

interface Data {
  text: string;
  billedCharacters: number;
  detectedSourceLang: Language["code"];
}

const apiRequest = async (data: TranslateTextsDTO) => {
  return axios.post<Data>("/api/translations", {
    data,
  });
};

const useTranslateTexts = () => {
  const [data, setData] = React.useState<Data>();
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const mutateAsync = async (data: TranslateTextsDTO) => {
    setIsLoading(true);

    const result = await apiRequest(data);

    setIsLoading(false);

    return result;
  };
  const mutate = async (data: TranslateTextsDTO) => {
    try {
      setIsLoading(true);
      const result = await apiRequest(data);

      setData(result.data);
      setIsError(false);
      setIsSuccess(true);
    } catch (error) {
      setError(error);
      setIsError(true);
      setIsSuccess(false);

      toast.error("Failed to translate texts");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isError,
    isSuccess,
    isLoading,
    setIsLoading,
    setIsError,
    setIsSuccess,
    mutate,
    mutateAsync,
  };
};

export default useTranslateTexts;
