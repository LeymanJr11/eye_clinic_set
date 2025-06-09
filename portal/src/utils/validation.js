export const validateName = (name) => {
  if (!name) return "Name is required";
  if (!/^[a-zA-Z\s]{2,100}$/.test(name)) {
    return "Name must only contain letters and spaces, between 2-100 characters";
  }
  return "";
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email format";
  }
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone is required";
  if (!/^\d{10}$/.test(phone)) {
    return "Phone number must be exactly 10 digits";
  }
  return "";
};

export const validateWalletAddress = (address) => {
  if (!address) return "Wallet address is required";
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return "Invalid Ethereum wallet address format";
  }
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return "";
};

export const validateDateOfBirth = (date) => {
  if (!date) return "Date of birth is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date must be in YYYY-MM-DD format";
  }
  const dob = new Date(date);
  const today = new Date();
  if (dob > today) {
    return "Date of birth cannot be in the future";
  }
  return "";
};

export const validateGender = (gender) => {
  if (!gender) return "Gender is required";
  if (!["male", "female"].includes(gender)) {
    return "Invalid gender selection";
  }
  return "";
};
