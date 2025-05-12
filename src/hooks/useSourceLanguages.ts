import axios from "axios";
import { Language } from "deepl-node";
import React from "react";
import { toast } from "sonner";

const useSourceLanguages = () => {
  const [data, setData] = React.useState<Omit<Language, "supportsFormality">[]>(
    []
  );
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get("/api/translations/languages/source");

      setData(result.data);
      setIsError(false);
      setIsSuccess(true);
    } catch (error) {
      setError(error);
      setIsError(true);
      setIsSuccess(false);

      toast.error("Failed to fetch translation source languages");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    refetch();
  }, []);

  return { data, error, isError, isSuccess, isLoading, refetch };
};

export default useSourceLanguages;
