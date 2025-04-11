import {
  QueryClient,
  type QueryKey,
  type UseQueryOptions,
  useQuery as useQueryOriginal,
} from "@tanstack/react-query";
import { type ErrorResponse } from "~/common/types/base-response";

export const useQuery = <
  TQueryFnData = unknown,
  TError = ErrorResponse,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
) => {
  return useQueryOriginal<TQueryFnData, TError, TData, TQueryKey>(options, queryClient);
};
