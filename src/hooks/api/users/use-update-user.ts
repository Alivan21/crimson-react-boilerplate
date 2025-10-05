import toast from "react-hot-toast";
import { updateUser } from "~/api/users";
import { type TUpdateUserRequest } from "~/api/users/schema";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useUpdateUserMutation = (id: string) => {
  return useMutation({
    mutationFn: (userData: TUpdateUserRequest) => updateUser(id, userData),
    onSuccess: () => {
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update user. Please try again.");
    },
    meta: {
      invalidatesQueries: [QUERY_KEY.USER.ALL],
    },
  });
};
