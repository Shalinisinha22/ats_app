import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { registerUser } from "../../redux/authSlice";
import { RootState } from "../../redux/store";
import type { AppDispatch } from "../../redux/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

type FormData = {
  fullName: string;
  email: string;
  mobileNumber?: string;
  password: string;
  cpassword:string;
};

type RegisterUserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    token: string;
  };
};

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();
  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();

    const formdata = {
      name: data.fullName,
      email: data.email,
      phone: data.mobileNumber,
      password: data.password,
      role: "candidate",
    };

    try {
      const actionResult = await dispatch(registerUser(formdata));

      if (registerUser.fulfilled.match(actionResult)) {
        // console.log(actionResult.payload);
        const result = actionResult.payload as RegisterUserResponse;

        // console.log("Registration success:", result);

        if (result?.user?.id) {
          navigation.replace("RegisterSuccess", {
            loginId: result.user.email,
            password: data.password,
          });
        } else {
          console.warn("Missing user ID in registration response");
        }
      } else {
        const error = actionResult.payload as string;
        console.error("Registration failed:", error);
      }
    } catch (error) {
      console.error("Registration exception:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#ffffff", "#f0f9ff"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => navigation.navigate("Login")}
          >
            <FontAwesome6 name="chevron-left" size={24} color="#000" />
            <Text
              allowFontScaling={false}
              style={{ fontSize: 18, marginLeft: 5 }}
            >
              Login
            </Text>
          </TouchableOpacity>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Create Account
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logos.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View> */}

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Candidate Account</Text>
            <Text style={styles.subtitle}>Join our community today</Text>

            <Controller
              control={control}
              name="fullName"
              rules={{ required: "Full name is required" }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#666"
                  />
                  {errors.fullName && (
                    <Text style={styles.errorText}>
                      {errors.fullName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#666"
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="mobileNumber"
              rules={{ required: "Mobile number is required" }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    placeholderTextColor="#666"
                  />
                  {errors.mobileNumber && (
                    <Text style={styles.errorText}>
                      {errors.mobileNumber.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    placeholderTextColor="#666"
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="cpassword"
              rules={{
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords not match",
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    placeholderTextColor="#666"
                  />
                  {errors.cpassword && (
                    <Text style={styles.errorText}>
                      {errors.cpassword.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity> */}
            </View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.linkText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginTop: height * 0.055,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: -width * 0.2,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: width * 0.05,
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: "flex-start", // Changed from 'center' to 'flex-start'
    marginBottom: isSmallDevice ? height * 0.02 : height * 0.03,
    marginTop: height * 0.01,
    paddingLeft: width * 0.05, // Added padding to move from the edge
  },
  logo: {
    width: width * 0.8, // Increased from 0.6 to 0.8
    height: width * 0.35, // Increased from 0.25 to 0.35
    marginBottom: 15,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: width * 0.05,
    marginTop: height * 0.055,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#666",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  inputContainer: {
    marginBottom: 15,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    paddingLeft: 45,
    borderRadius: 12,
    marginBottom: 5,
    backgroundColor: "#f8f9fa",
    fontSize: isSmallDevice ? 14 : 16,
  },
  buttonContainer: {
    gap: 10,
    marginTop: height * 0.02,
  },
  button: {
    backgroundColor: "#1dbf73",
    padding: isSmallDevice ? 12 : 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: isSmallDevice ? 14 : 16,
  },
  loginButton: {
    backgroundColor: "#4a90e2",
  },
  linkButton: {
    marginTop: height * 0.02,
  },
  linkText: {
    color: "#1dbf73",
    textAlign: "center",
    fontSize: isSmallDevice ? 13 : 14,
  },
  errorText: {
    color: "#dc3545",
    fontSize: isSmallDevice ? 12 : 14,
    textAlign: "center",
    marginBottom: 10,
  },
});
