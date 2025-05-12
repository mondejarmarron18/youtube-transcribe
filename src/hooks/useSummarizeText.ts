import axios, { isAxiosError } from "axios";
import React from "react";
import { toast } from "sonner";

interface SummarizeTextDTO {
  text: string;
}

type Data = string;

const apiRequest = async (data: SummarizeTextDTO) => {
  return axios.post<Data>("/api/summarizations", {
    data,
  });
};

const useSummarizeText = () => {
  const [data, setData] = React.useState<Data>();
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const mutateAsync = async (data: SummarizeTextDTO) => {
    setIsLoading(true);

    const result = await apiRequest(data)
      .then((res) => {
        setData(res.data);
        setIsError(false);
        setIsSuccess(true);
        setError(undefined);

        return res;
      })
      .catch((error) => {
        setError(error);
        setIsError(true);
        setIsSuccess(false);

        if (isAxiosError(error) && error.response?.data) {
          toast.error(error.response.data);
        } else {
          toast.error("Something went wrong");
        }

        return error;
      });

    setIsLoading(false);

    return result;
  };

  const mutate = async (data: SummarizeTextDTO) => {
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

      toast.error("Failed to summarize texts");
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

export default useSummarizeText;
