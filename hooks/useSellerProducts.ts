import { useQuery } from "@tanstack/react-query";
import { getProductsBySeller } from "@/services/productService";
import { useAuthStore } from "@/store/useAuthStore";

export const useSellerProducts = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["seller-products", user?.id],
    queryFn: () => getProductsBySeller(user.id),
    enabled: !!user?.id,
  });
};