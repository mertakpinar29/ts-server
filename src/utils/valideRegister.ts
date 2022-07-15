import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Username length must be greater than 2",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username shouldn't contain '@' sign.",
      },
    ];
  }

  if (options.password.length < 8) {
    return [
      {
        field: "password",
        message: "Password length must be greater than 7",
      },
    ];
  }

  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email.",
      },
    ];
  }

  return null;
};
