import { useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "~/api/users";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useDeleteUserMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(id),
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
