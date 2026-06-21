export type AdminActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export const initialAdminActionState: AdminActionState = {
  success: false,
  message: "",
};
