import {
  QueryClient,
  type UseMutationOptions,
  useMutation as useMutationOriginal,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { type TErrorResponse } from "~/common/types/base-response";

export const useMutation = <
  TData = unknown,
  TError = AxiosError<TErrorResponse>,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
) => useMutationOriginal<TData, TError, TVariables, TContext>(options, queryClient);
