import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteUser } from "~/api/users";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      toast.success("User deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USER.LIST],
      });

      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USER.DETAIL],
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user. Please try again.");
    },
  });
};
