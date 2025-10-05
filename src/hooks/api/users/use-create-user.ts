import toast from "react-hot-toast";
import { createUser } from "~/api/users";
import { type TCreateUserRequest } from "~/api/users/schema";
import { QUERY_KEY } from "~/common/constants/query-keys";
import { useMutation } from "~/hooks/request/use-mutation";

export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: (userData: TCreateUserRequest) => createUser(userData),
    onSuccess: () => {
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create user. Please try again.");
    },
    meta: {
      invalidatesQueries: [QUERY_KEY.USER.ALL],
    },
  });
};
