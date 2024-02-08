import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { useState } from "react";

export const useApiMutation = (
  mutationFunction: FunctionReference<"mutation">
) => {
  const [pending, setPending] = useState(false);
  const apiMutation = useMutation(mutationFunction);
  const mutate = (paylod: any) => {
    setPending(true);
    return apiMutation(paylod)
      .finally(() => setPending(false))
      .then((result) => {
        return result;
      })
      .catch((err) => err);
  };
  return { mutate, pending };
};
