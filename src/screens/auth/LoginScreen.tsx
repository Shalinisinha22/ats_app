import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { loginUser, skipLogin,fetchUserProfile } from "../../redux/authSlice";
import { RootState } from "../../redux/store";
import type { AppDispatch } from "../../redux/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useAppSelector } from "../../redux/store";
type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();

    const formData = {
      email: data.email,
      password: data.password,
    };

    try {
      const resultAction = await dispatch(loginUser(formData));
      // console.log(resultAction, "resultAction");


      if (loginUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: "success",
          text1: "Login Successful",
        });

        
       
   
        
            
           
         
       
      } else if (loginUser.rejected.match(resultAction)) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: resultAction.payload?.message || "Invalid credentials",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });
    }
  };

  const handleSkip = () => {
    dispatch(skipLogin());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#ffffff", "#f0f9ff"]} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logos.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

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

            <>
              <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
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
            </>

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
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity> */}
            </View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.linkText}>
                Don't have an account? Register
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: height * 0.02, // Reduced from 0.05 to move everything up
    paddingHorizontal: width * 0.05,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: -height * 0.03, // Negative margin to pull form up closer to logo
  },
  logo: {
    width: width * 0.75,
    height: width * 0.6, // Slightly reduced height to make more compact
    marginBottom: 0,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: isSmallDevice ? width * 0.04 : width * 0.05,
    marginTop: height * 0.02, // Small top margin
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
    color: "black",
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
  registerButton: {
    backgroundColor: "#4a90e2",
  },
  skipButton: {
    backgroundColor: "#6c757d",
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
