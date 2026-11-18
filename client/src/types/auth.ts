export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ChangePassFormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
