import React, { use, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { applyToJob } from '../../redux/jobsSlice';
import { Job } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { nanoid } from '@reduxjs/toolkit';

type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
};

type ExperienceEntry = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Props = {
  navigation: NativeStackNavigationProp<DrawerParamList>;
  route: {
    params: {
      job: Job;
    };
  };
};

type FormData = {
  email: string;
  fullname: string;
  headline: string;
  summary: string;
  phone: string;
  currentLocation: string;
  preferredWorkLocation: string;
  totalExperience: string;
  relevantExperience: string;
  currentCompany: string;
  currentJobTitle: string;
  noticePeriod: string;
  currentCTC: string;
  expectedCTC: string;
  reasonForJobChange: string;
  projectDescription: string;
  termsAccepted: boolean;
};
const EDUCATION_OPTIONS = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'Ph.D.',
  'Other',
];

export default function JobApplicationScreen({ navigation, route }: Props) {
  const { job } = route.params;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const userProfile = useAppSelector((state: RootState) => state.auth.userProfile);

  // console.log(userProfile, 'userProfilejob application');
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      // Step 1 fields
      email: user?.email || '',
      fullname: user?.name || '',
      headline: userProfile?.headline || '',
      summary: userProfile?.summary || '',

      // Step 2 fields - ensure these have their own values
      phone: '', // Remove the user?.phone reference to avoid duplication
      currentLocation: '', // Remove userProfile reference
      preferredWorkLocation: '', // Remove userProfile reference

      // ...rest of the fields remain same...
      totalExperience: '',
      relevantExperience: '',
      currentCompany: userProfile?.currentCompany || '',
      currentJobTitle: userProfile?.currentJobTitle || '',
      noticePeriod: '',
      currentCTC: userProfile?.currentCTC?.toString() || '',
      expectedCTC: userProfile?.expectedCTC?.toString() || '',
      reasonForJobChange: userProfile?.reasonForJobChange || '',
      projectDescription: '',
      termsAccepted: false,
    },
  });

  // Add this to track form values
  const formValues = watch();

  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    {
      id: nanoid(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    },
  ]);

  // Add these helper functions inside the component
  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      {
        id: nanoid(),
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const removeEducationEntry = (id: string) => {
    setEducationEntries(educationEntries.filter((entry) => entry.id !== id));
  };

  const updateEducationEntry = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationEntries(
      educationEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([
    {
      id: nanoid(),
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ]);

  const addExperienceEntry = () => {
    setExperienceEntries([
      ...experienceEntries,
      {
        id: nanoid(),
        companyName: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const removeExperienceEntry = (id: string) => {
    setExperienceEntries(experienceEntries.filter((entry) => entry.id !== id));
  };

  const updateExperienceEntry = (id: string, field: keyof ExperienceEntry, value: string) => {
    setExperienceEntries(
      experienceEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Add this new state to track mounted steps
  const [mountedSteps, setMountedSteps] = useState<number[]>([1]);

  // Update handleNext and handleBack to manage mounted steps
  const handleNext = () => {
    if (step < 6) {
      // Store current step's data
      const currentValues = getValues();

      // Update form data
      Object.keys(currentValues).forEach((key) => {
        setValue(key as keyof FormData, currentValues[key as keyof FormData]);
      });

      const nextStep = step + 1;
      setStep(nextStep);
      if (!mountedSteps.includes(nextStep)) {
        setMountedSteps([...mountedSteps, nextStep]);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // Store current step's data
      const currentValues = getValues();

      // Update form data
      Object.keys(currentValues).forEach((key) => {
        setValue(key as keyof FormData, currentValues[key as keyof FormData]);
      });

      setStep(step - 1);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });
      if (!result.canceled) {
        setResumeFile(result);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!resumeFile || resumeFile.canceled) {
      Alert.alert('Error', 'Please upload your resume');
      return;
    }

    try {
      setIsSubmitting(true);

      const applicationData = {
        email: data.email,
        fullName: data.fullname,
        headline: data.headline,
        summary: data.summary,

        phone: data.phone,
        currentLocation: data.currentLocation,
        preferredWorkLocation: data.preferredWorkLocation,

        education: educationEntries,
        experience: experienceEntries,

        currentCompany: data.currentCompany,
        currentJobTitle: data.currentJobTitle,
        totalExperience: data.totalExperience,
        relevantExperience: data.relevantExperience,
        noticePeriod: data.noticePeriod,
        currentCTC: data.currentCTC,
        expectedCTC: data.expectedCTC,
        reasonForJobChange: data.reasonForJobChange,

        projectDescription: data.projectDescription,
        termsAccepted: data.termsAccepted,
        resumeFile: resumeFile.assets[0],
        appliedDate: new Date().toISOString(),
        jobId: job._id, // Update this line to use _id instead of id
        status: 'pending',
      };

      const result = await dispatch(applyToJob({ ...job, applicationData })).unwrap();

      // Show success message and navigate
      Alert.alert(
        'Success!',
        'Your job application has been submitted successfully.',
        [
          {
            text: 'View Applied Jobs',
            onPress: () => navigation.replace('AppliedJobs'),
          },
          {
            text: 'Browse More Jobs',
            onPress: () => navigation.replace('BrowseJobs'),
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit application. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update renderStep to use formValues
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 1: Personal Information</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Email"
                  value={formValues.email}
                  onChangeText={onChange}
                  keyboardType="email-address"
                />
              )}
            />
            <Controller
              control={control}
              name="fullname"
              rules={{ required: 'Full name is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Full Name"
                  value={formValues.fullname}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="headline"
              rules={{ required: 'Professional headline is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Professional Headline"
                  value={formValues.headline}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="summary"
              rules={{ required: 'Professional summary is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                   placeholderTextColor="#666"
                  placeholder="Professional Summary"
                  value={formValues.summary}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 2: Contact & Location Details</Text>
            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Phone Number"
                  value={formValues.phone}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) {
                      onChange(text);
                      setValue('phone', text); // Explicitly set the value
                    }
                  }}
                  keyboardType="phone-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="currentLocation"
              rules={{ required: 'Current location is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Current Location (City, State)"
                  value={formValues.currentLocation}
                  onChangeText={(text) => {
                    onChange(text);
                    setValue('currentLocation', text); // Explicitly set the value
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="preferredWorkLocation"
              rules={{ required: 'Preferred location is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Preferred Work Location"
                  value={formValues.preferredWorkLocation}
                  onChangeText={(text) => {
                    onChange(text);
                    setValue('preferredWorkLocation', text); // Explicitly set the value
                  }}
                />
              )}
            />
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 3: Education & Experience</Text>

            <Text style={styles.sectionSubtitle}>Education</Text>
            {educationEntries.map((entry) => (
              <View key={entry.id} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>Education Entry</Text>
                  <TouchableOpacity
                    onPress={() => removeEducationEntry(entry.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  value={entry.degree}
                  onChangeText={(text) => updateEducationEntry(entry.id, 'degree', text)}
                  placeholder="Degree/Certification"
                   placeholderTextColor="#666"
                />

                <TextInput
                  style={styles.input}
                  value={entry.institution}
                  onChangeText={(text) => updateEducationEntry(entry.id, 'institution', text)}
                  placeholder="Institution Name"
                   placeholderTextColor="#666"
                />

                <View style={styles.dateContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={entry.startDate}
                    onChangeText={(text) => updateEducationEntry(entry.id, 'startDate', text)}
                    placeholder="Start Date"
                     placeholderTextColor="#666"
                  />
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={entry.endDate}
                    onChangeText={(text) => updateEducationEntry(entry.id, 'endDate', text)}
                    placeholder="End Date"
                     placeholderTextColor="#666"
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addEducationEntry}>
              <Ionicons name="add-circle" size={24} color="#1dbf73" />
              <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>

            {/* Rest of your experience fields */}
            <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Work Experience</Text>
            {experienceEntries.map((entry) => (
              <View key={entry.id} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>Work Experience Entry</Text>
                  <TouchableOpacity
                    onPress={() => removeExperienceEntry(entry.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  value={entry.companyName}
                  onChangeText={(text) => updateExperienceEntry(entry.id, 'companyName', text)}
                  placeholder="Company Name"
                   placeholderTextColor="#666"
                />

                <TextInput
                  style={styles.input}
                  value={entry.jobTitle}
                  onChangeText={(text) => updateExperienceEntry(entry.id, 'jobTitle', text)}
                  placeholder="Job Title"
                   placeholderTextColor="#666"
                />

                <View style={styles.dateContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={entry.startDate}
                    onChangeText={(text) => updateExperienceEntry(entry.id, 'startDate', text)}
                    placeholder="Start Date"
                     placeholderTextColor="#666"
                  />
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={entry.endDate}
                    onChangeText={(text) => updateExperienceEntry(entry.id, 'endDate', text)}
                    placeholder="End Date"
                     placeholderTextColor="#666"
                  />
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={entry.description}
                  onChangeText={(text) => updateExperienceEntry(entry.id, 'description', text)}
                  placeholder="Job Description"
                   placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addExperienceEntry}>
              <Ionicons name="add-circle" size={24} color="#1dbf73" />
              <Text style={styles.addButtonText}>Add Work Experience</Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 4: Additional Details</Text>
            <Controller
              control={control}
              name="noticePeriod"
              rules={{ required: 'Notice period is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Notice Period (in days)"
                   placeholderTextColor="#666"
                  value={formValues.noticePeriod}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />
            <Controller
              control={control}
              name="currentCTC"
              rules={{ required: 'Current CTC is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                   placeholderTextColor="#666"
                  placeholder="Current CTC (₹ LPA)"
                  value={formValues.currentCTC}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />
            <Controller
              control={control}
              name="expectedCTC"
              rules={{ required: 'Expected CTC is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Expected CTC (₹ LPA)"
                   placeholderTextColor="#666"
                  value={formValues.expectedCTC}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />
            <Controller
              control={control}
              name="reasonForJobChange"
              rules={{ required: 'Reason for change is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Reason for Job Change"
                   placeholderTextColor="#666"
                  value={formValues.reasonForJobChange}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 5: Project Assignment</Text>
            <Text style={styles.label}>Please answer the following questions:</Text>
            <Text style={styles.question}>
              1. Describe a challenging project you've worked on in the renewable energy sector.
              {'\n'}
              2. What specific skills make you suitable for this role?
              {'\n'}
              3. How would you manage a solar project from start to finish?
            </Text>
            <Controller
              control={control}
              name="projectDescription"
              rules={{ required: 'Project description is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                   placeholderTextColor="#666"
                  placeholder="Your Response"
                  value={formValues.projectDescription}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={8}
                />
              )}
            />
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 6: Resume Upload</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Text style={styles.uploadButtonText}>
                {resumeFile && !resumeFile.canceled
                  ? `Selected: ${resumeFile.assets[0].name}`
                  : 'Upload Resume (PDF, DOC, DOCX — Max: 5MB)'}
              </Text>
            </TouchableOpacity>
            <View style={styles.checkboxContainer}>
              <Controller
                control={control}
                name="termsAccepted"
                rules={{ required: 'You must accept the terms' }}
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[styles.checkbox, value && styles.checkboxChecked]}
                    onPress={() => onChange(!value)}
                  >
                    <Text style={styles.checkboxText}>
                      I agree to the Terms and Privacy Policy
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.subtitle}>
          {job.company?.userId?.name || 'Company Name'} {/* Use optional chaining to safely access nested properties */}
        </Text>
      </View>

      <View style={styles.progressBar}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index + 1 <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {renderStep()}

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 6 ? (
          <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dee2e6',
  },
  progressDotActive: {
    backgroundColor: '#1dbf73',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#212529',
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: '#1dbf73',
  },
  submitButton: {
    backgroundColor: '#1dbf73',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#1dbf73',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#1dbf73',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
  },
  checkboxChecked: {
    backgroundColor: '#e8f5e9',
    borderColor: '#1dbf73',
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#212529',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#94e0be',
  },
  disabledText: {
    color: '#ffffff80',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  entryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  removeButton: {
    padding: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 0.48,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1dbf73',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1dbf73',
    fontWeight: '500',
  },
});