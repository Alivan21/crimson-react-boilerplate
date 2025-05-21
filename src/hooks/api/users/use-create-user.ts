import { useQueryClient } from "@tanstack/react-query";
import { createUser } from "~/api/users";
import { type TCreateUserRequest } from "~/api/users/schema";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: TCreateUserRequest) => createUser(userData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USER.LIST],
      });
    },
  });
};
