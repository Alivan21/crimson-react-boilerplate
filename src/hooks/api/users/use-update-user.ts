import { useQueryClient } from "@tanstack/react-query";
import { updateUser } from "~/api/users";
import { type TUpdateUserRequest } from "~/api/users/schema";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useUpdateUserMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: TUpdateUserRequest) => updateUser(id, userData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USER.LIST],
      });

      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USER.DETAIL, id],
      });
    },
  });
};
