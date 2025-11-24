export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return "L'email est requis";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Format d'email invalide";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Le mot de passe est requis";
  }
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  if (!/[@$!%*?&]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)";
  }
  return null;
}

export function validateName(name: string, fieldName: string): string | null {
  if (!name) {
    return `Le ${fieldName} est requis`;
  }
  if (name.length < 2) {
    return `Le ${fieldName} doit contenir au moins 2 caractères`;
  }
  return null;
}

export function validateRegisterForm(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.push({ field: "password", message: passwordError });
  }

  const firstNameError = validateName(data.firstName, "prénom");
  if (firstNameError) {
    errors.push({ field: "firstName", message: firstNameError });
  }

  const lastNameError = validateName(data.lastName, "nom");
  if (lastNameError) {
    errors.push({ field: "lastName", message: lastNameError });
  }

  return errors;
}
