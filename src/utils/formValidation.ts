export const validateSignUpForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!formData.firstName) errors.firstName = "First name is required";
  if (!formData.lastName) errors.lastName = "Last name is required";
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email is invalid";
  }
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  if (formData.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number format";
  }

  return errors;
};