import api from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";

const useMutateCurrentUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCurrentUser } = useAuth((state) => state.actions);

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
