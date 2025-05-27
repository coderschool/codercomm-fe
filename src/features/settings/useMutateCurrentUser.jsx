import api from "@/lib/api";
import { useState } from "react";
import { useAuthAction } from "@/lib/auth/useAuth";

const useMutateCurrentUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCurrentUser } = useAuthAction();

  const mutate = async (updateData) => {
    setIsLoading(true);
    try {
      const { user } = await api.put("/users/me", updateData);
      setCurrentUser(user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
};

export default useMutateCurrentUser;
