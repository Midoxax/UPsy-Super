import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CouponValidation {
  couponId: string;
  discountMad: number;
  finalMad: number;
}

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({
      code,
      amountMad,
      appliesTo,
    }: {
      code: string;
      amountMad: number;
      appliesTo: "subscription" | "boost" | "course" | "session" | "all";
    }): Promise<CouponValidation> => {
      const { data, error } = await supabase.rpc("validate_coupon", {
        _code: code,
        _amount_mad: amountMad,
        _applies_to: appliesTo,
      });
      if (error) throw error;
      const row = (data as any[])?.[0];
      if (!row) throw new Error("Invalid or expired coupon");
      return {
        couponId: row.coupon_id,
        discountMad: Number(row.discount_mad),
        finalMad: Number(row.final_mad),
      };
    },
  });
};
