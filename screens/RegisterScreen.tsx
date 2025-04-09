import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../redux/slices/authSlice";
import { RootState } from "../redux/store";
import { registerUser } from "../services/apiService";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  Home: undefined; // Add Home route
};

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();

  const colors = {
    background: theme === "dark" ? "#121212" : "#F5F7FA",
    cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    textPrimary: theme === "dark" ? "#FFFFFF" : "#333333",
    textSecondary: theme === "dark" ? "#AAAAAA" : "#666666",
    inputBackground: theme === "dark" ? "#2C2C2C" : "#F0F2F5",
    border: theme === "dark" ? "#333333" : "#E1E4E8",
    primary: "#4A6FFF",
    error: "#F44336",
    weak: "#FF5722",
    medium: "#FFC107",
    strong: "#4CAF50",
    success: "#4CAF50",
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
      if (password && confirmPassword && password !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }

    const isValueThere = (value: string) => {
      return value !== undefined && value.trim() !== "";
    };

    const hasNoErrors: boolean =
      !errors.name &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword &&
      password === confirmPassword &&
      isValueThere(name) &&
      isValueThere(email) &&
      isValueThere(password) &&
      isValueThere(confirmPassword);
    setIsFormValid(hasNoErrors);
  }, [
    name,
    email,
    password,
    confirmPassword,
    errors.name,
    errors.email,
    errors.password,
  ]);

  const handleRegister = async () => {
    if (!isFormValid) {
      // Find first error to show to user
      let errorMessage = "";
      if (errors.name) errorMessage = errors.name;
      else if (errors.email) errorMessage = errors.email;
      else if (errors.password) errorMessage = errors.password;
      else if (!passwordsMatch) errorMessage = "Passwords do not match";
      else errorMessage = "Please fill all required fields";

      // Alert the user about the error
      alert(errorMessage);
      return;
    }

    dispatch(loginStart());
    try {
      const response = await registerUser({
        name: name,
        email: email,
        password: password,
      });
      console.log("Register Response:", JSON.stringify(response, null, 2));
      dispatch(loginSuccess(response));
      // navigation.navigate("Home");
    } catch (err: any) {
      dispatch(loginFailure(err.message));
    }
  };

  useEffect(() => {
    const checkPasswordStrength = () => {
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      let score = 0;
      if (hasMinLength) score++;
      if (hasUpperCase) score++;
      if (hasLowerCase) score++;
      if (hasNumber) score++;
      if (hasSpecialChar) score++;

      setPasswordStrength({
        score,
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
      });
    };

    checkPasswordStrength();
  }, [password]);

  const getPasswordStrengthLabel = () => {
    const { score } = passwordStrength;
    if (password === "") return "";
    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (password === "") return colors.textSecondary;
    if (score <= 2) return colors.weak;
    if (score <= 4) return colors.medium;
    return colors.strong;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Create Account
          </Text>
          <View style={styles.spacer} />
        </View>

        <View
          style={[styles.formCard, { backgroundColor: colors.cardBackground }]}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Full Name
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
                errors.name ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Email
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
                errors.email ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
                errors.password ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.passwordVisibilityButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {password !== "" && (
              <View style={styles.passwordStrengthContainer}>
                <Text
                  style={[
                    styles.passwordStrengthLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Password Strength:
                </Text>
                <Text
                  style={{
                    color: getPasswordStrengthColor(),
                    fontWeight: "600",
                  }}
                >
                  {getPasswordStrengthLabel()}
                </Text>
              </View>
            )}

            {password !== "" && (
              <View style={styles.passwordRequirements}>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={
                      passwordStrength.hasMinLength
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordStrength.hasMinLength
                        ? colors.success
                        : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passwordStrength.hasMinLength
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={
                      passwordStrength.hasUpperCase
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordStrength.hasUpperCase
                        ? colors.success
                        : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passwordStrength.hasUpperCase
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    Uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={
                      passwordStrength.hasLowerCase
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordStrength.hasLowerCase
                        ? colors.success
                        : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passwordStrength.hasLowerCase
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    Lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={
                      passwordStrength.hasNumber
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordStrength.hasNumber ? colors.success : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passwordStrength.hasNumber
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    Number (0-9)
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={
                      passwordStrength.hasSpecialChar
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordStrength.hasSpecialChar
                        ? colors.success
                        : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passwordStrength.hasSpecialChar
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    Special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Confirm Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBackground },
                errors.confirmPassword ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.passwordVisibilityButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: isFormValid
                  ? colors.primary
                  : colors.primary + "60",
              },
            ]}
            onPress={handleRegister}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text
              style={[styles.haveAccountText, { color: colors.textSecondary }]}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.loginButtonText, { color: colors.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  spacer: {
    width: 40,
  },
  formCard: {
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    height: 50,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
  passwordVisibilityButton: {
    padding: 12,
  },
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  haveAccountText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginButton: {
    padding: 4,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  passwordStrengthLabel: {
    marginRight: 8,
  },
  passwordRequirements: {
    marginTop: 4,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
  },
});
