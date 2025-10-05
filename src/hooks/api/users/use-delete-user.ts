import toast from "react-hot-toast";
import { deleteUser } from "~/api/users";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useDeleteUserMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user. Please try again.");
    },
    meta: {
      invalidatesQueries: [QUERY_KEY.USER.ALL],
    },
  });
};
