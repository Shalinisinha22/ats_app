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
import { applyToJob, applyJobToApi, fetchAppliedJobs } from '../../redux/jobsSlice';
import { Job } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { nanoid } from '@reduxjs/toolkit';
import DateTimePicker from '@react-native-community/datetimepicker';
import Tooltip from 'react-native-walkthrough-tooltip';
import { format } from 'date-fns';
import { uploadToCloudinary } from '../../utils/cloudinary';

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
  achievement: string;
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
  const { user } = useAppSelector((state) => state.auth);
  const userProfile = useAppSelector((state: RootState) => state.auth.userProfile);
  const [resumeFile, setResumeFile] = useState<DocumentPicker.DocumentResult | null>(userProfile?.resume || null);


  // console.log(userProfile)

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
      email: user?.email || '',
      fullname: user?.name || '',
      headline: userProfile?.headline || '',
      summary: userProfile?.summary || '',
      phone: user?.phone || '',
      currentLocation: userProfile?.currentLocation || '',
      // preferredWorkLocation: userProfile?.preferredWorkLocation || '',
      totalExperience: '',
      relevantExperience: '',
      currentCompany: userProfile?.currentCompany || '',
      currentJobTitle: userProfile?.currentJobTitle || '',
      noticePeriod: userProfile?.noticePeriod || '',
      currentCTC: userProfile?.currentCTC?.toString() || '',
      expectedCTC: userProfile?.expectedCTC?.toString() || '',
      reasonForJobChange: userProfile?.reasonForJobChange || '',
      achievement: userProfile?.achievement || '',
      termsAccepted: false,
      education:userProfile?.education || [],
      experience:userProfile?.experience || [],
    },
    mode: 'onChange',
    // rules: {
    //   email: { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } },
    //   fullname: { required: 'Full name is required' },
    //   headline: { required: 'Professional headline is required' },
    //   summary: { required: 'Professional summary is required' },
    //   phone: { required: 'Phone number is required' },
    //   currentLocation: { required: 'Current location is required' },
    //   preferredWorkLocation: { required: 'Preferred location is required' },
    //   termsAccepted: { required: 'You must accept the terms' }
    // }
  });
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [activeDateField, setActiveDateField] = useState({ id: '', type: '', field: '' });

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (event: any, selectedDate?: Date) => {
    const { id, type, field } = activeDateField;
    if (event.type === 'dismissed') {
      setShowStartDate(false);
      setShowEndDate(false);
      return;
    }

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      if (type === 'education') {
        updateEducationEntry(id, field as keyof EducationEntry, formattedDate);
      } else {
        updateExperienceEntry(id, field as keyof ExperienceEntry, formattedDate);
      }
    }

    setShowStartDate(false);
    setShowEndDate(false);
  };

  const formValues = watch();

  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(() => {
    if (userProfile?.education && userProfile.education.length > 0) {
      return userProfile.education.map(edu => ({
        id: nanoid(),
        degree: edu.degree || '',
        institution: edu.institution || '',
        startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
        endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      }));
    }
    return [{
      id: nanoid(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    }];
  });

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
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(() => {
    if (userProfile?.experience && userProfile.experience.length > 0) {
      return userProfile.experience.map(exp => ({
        id: nanoid(),
        companyName: exp.company || '',
        jobTitle: exp.title || '',
        startDate: exp.startDate ? format(new Date(exp.startDate), 'yyyy-MM-dd') : '',
        endDate: exp.endDate ? format(new Date(exp.endDate), 'yyyy-MM-dd') : '',
        description: exp.description || ''
      }));
    }
    return [{
      id: nanoid(),
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      description: ''
    }];
  });

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

  const [mountedSteps, setMountedSteps] = useState<number[]>([1]);

  const handleNext = () => {
    if (step < 6) {
      const currentValues = getValues();
      let hasError = false;
  
      // Validate fields based on current step
      switch (step) {
        case 1:
          if (!currentValues.email || !currentValues.fullname) {
            Alert.alert('Error', 'Please fill in all required fields in Personal Information');
            hasError = true;
          }
          break;
  
        case 2:
          if (!currentValues.phone || !currentValues.currentLocation) {
            Alert.alert('Error', 'Please fill in all contact and location details');
            hasError = true;
          }
          break;
      }
  
      if (hasError) return;
  
      const nextStep = step + 1;
      setStep(nextStep);
      if (!mountedSteps.includes(nextStep)) {
        setMountedSteps([...mountedSteps, nextStep]);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const currentValues = getValues();

      Object.keys(currentValues).forEach((key) => {
        setValue(key as keyof FormData, currentValues[key as keyof FormData]);
      });

      setStep(step - 1);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });

      if (!result.canceled) {
        const fileInfo = result.assets[0];
        if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

       try {
              // Upload to Cloudinary
              const cloudinaryResponse = await uploadToCloudinary(fileInfo.uri, 'raw');
              console.log('Resume upload response:', cloudinaryResponse);
    
              if (cloudinaryResponse) {
                setResumeFile({
                  url: cloudinaryResponse.secure_url,
                  name: fileInfo.name,
                  extension:"pdf",
                });
                
                Alert.alert('Success', 'Resume uploaded successfully');
              }
            } catch (error: any) {
              console.error('Resume upload error:', error);
              Alert.alert(
                'Error',
                error?.message || 'Failed to upload resume. Please try again.'
              );
            } finally {
              setIsUploadingResume(false);
            }
          }
        } catch (error: any) {
          console.error('Document picker error:', error);
          Alert.alert('Error', 'Failed to pick resume');
        }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

        if (!data.termsAccepted) {
      Alert.alert(
        'Terms & Conditions Required',
        'Please accept the terms and conditions to proceed with your application.'
      );
      setIsSubmitting(false);
      return;
    }

 
      // Validate resume
      if (!resumeFile) {
        Alert.alert('Error', 'Please upload your resume');
        setIsSubmitting(false);
        return;
      }

  

      // console.log('Submitting application...', data); 

      const applicationData = {
        jobId: job._id,
        email: data.email,
        name: data.fullname,
        headline: data.headline,
        summary: data.summary,
        phone: data.phone,
        currentLocation: data.currentLocation,
        education: educationEntries,
        experience: experienceEntries,
        noticePeriod: data.noticePeriod,
        currentCTC: data.currentCTC,
        expectedCTC: data.expectedCTC,
        reasonForJobChange: data.reasonForJobChange,
        resume: {
          url: resumeFile.url, 
          name: resumeFile.name,
          extension: resumeFile.extension,
        }
      };

      // console.log('Application data:', applicationData); 

      const result = await dispatch(applyJobToApi({ job, applicationData })).unwrap();
      // console.log('API Response:', result); // Add this for debugging

      await dispatch(fetchAppliedJobs()).unwrap();

       Alert.alert(
      'Success!',
      'Your job application has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                { 
                  name: 'MainStack',
                  state: {
                    routes: [
                      {
                        name: 'MainTabs',
                        state: {
                          routes: [{ name: 'AppliedJobs' }]
                        }
                      }
                    ]
                  }
                }
              ]
            });
          }
        }
      ]
    );
      
    } catch (error: any) {
      console.error('Application submission error:', error); // Add this for debugging
      Alert.alert(
        'Error',
        error?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputLabel = ({ label, tooltip, required = false, showToolTip }) => {
    const [showTip, setShowTip] = useState(false);
    
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>

        {showToolTip && (
          <Tooltip
            isVisible={showTip}
            content={
              <Text style={[styles.tooltipText, { color: '#111' }]}>{tooltip}</Text>
            }
            placement="top"
            onClose={() => setShowTip(false)}
          >
            <TouchableOpacity 
              onPress={() => setShowTip(prev => !prev)}
              style={styles.tooltipButton}
            >
              <Ionicons 
                name="information-circle-outline" 
                size={20} 
                color="#6c757d" 
              />
            </TouchableOpacity>
          </Tooltip>
        )}
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Step 1: Personal Information</Text>
            <InputLabel 
              label="Email Address"
              tooltip="Enter your primary email address eg. user@gmail.com"
              required
              showToolTip={true}
            />
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
            <InputLabel 
              label="Full Name"
              required
              showToolTip={false}
            />
            <Controller
              control={control}
              name="fullname"
              label="Full Name"
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
            <InputLabel 
              label="Professional Headline"
              tooltip="A brief title that describes your professional identity (e.g., 'Senior Software Engineer')"
      
              showToolTip={true}
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
            <InputLabel 
              label="Professional Summary"
              tooltip="Provide a concise overview of your professional background"
        
              showToolTip={true}
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
            <InputLabel 
              label="Mobile Number"
              required
              showToolTip={false}
            />
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
                      setValue('phone', text);
                    }
                  }}
                  keyboardType="phone-pad"
                />
              )}
            />
            <InputLabel 
              label="Current Location"
              required
              showToolTip={false}
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
                    setValue('currentLocation', text);
                  }}
                />
              )}
            />
            {/* <InputLabel 
              label="Preferred Work Location"
              required
              showToolTip={false}
            /> */}
            {/* <Controller
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
                    setValue('preferredWorkLocation', text);
                  }}
                />
              )}
            /> */}
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
                <InputLabel 
                  label="Degree/Certification"
               
                  showToolTip={false}
                />
                <TextInput
                  style={styles.input}
                  value={entry.degree}
                  onChangeText={(text) => updateEducationEntry(entry.id, 'degree', text)}
                  placeholder="Degree/Certification"
                  placeholderTextColor="#666"
                />
                <InputLabel 
                  label="Institution Name"
            
                  showToolTip={false}
                />
                <TextInput
                  style={styles.input}
                  value={entry.institution}
                  onChangeText={(text) => updateEducationEntry(entry.id, 'institution', text)}
                  placeholder="Institution Name"
                  placeholderTextColor="#666"
                />

                  <InputLabel 
                  label="Duration"
                  tooltip="Period of study"
                  showToolTip={false}
                />
                <View style={styles.dateContainer}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => {
                      setActiveDateField({ id: entry.id, type: 'education', field: 'startDate' });
                      setShowStartDate(true);
                    }}
                  >

              
                    <View style={styles.dateInputContent}>
                      <Text style={entry.startDate ? styles.dateText : styles.placeholderText}>
                        {entry.startDate || 'Start Date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => {
                      setActiveDateField({ id: entry.id, type: 'education', field: 'endDate' });
                      setShowEndDate(true);
                    }}
                  >
                    <View style={styles.dateInputContent}>
                      <Text style={entry.endDate ? styles.dateText : styles.placeholderText}>
                        {entry.endDate || 'End Date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addEducationEntry}>
              <Ionicons name="add-circle" size={24} color="#1dbf73" />
              <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>
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
                
                <InputLabel 
                  label="Company Name"
                  tooltip="Enter the name of the company you worked for"
                  showToolTip={true}
                />
                <TextInput
                  style={styles.input}
                  value={entry.companyName}
                  onChangeText={(text) => updateExperienceEntry(entry.id, 'companyName', text)}
                  placeholder="Company Name"
                  placeholderTextColor="#666"
                />

                <InputLabel 
                  label="Job Title"
                  tooltip="Your role or position in the company"
                  showToolTip={true}
                />
                <TextInput
                  style={styles.input}
                  value={entry.jobTitle}
                  onChangeText={(text) => updateExperienceEntry(entry.id, 'jobTitle', text)}
                  placeholder="Job Title"
                  placeholderTextColor="#666"
                />

                <InputLabel 
                  label="Employment Duration"
                  tooltip="Period of employment"
                  showToolTip={true}
                />
                <View style={styles.dateContainer}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => {
                      setActiveDateField({ id: entry.id, type: 'experience', field: 'startDate' });
                      setShowStartDate(true);
                    }}
                  >
                    <View style={styles.dateInputContent}>
                      <Text style={entry.startDate ? styles.dateText : styles.placeholderText}>
                        {entry.startDate || 'Start Date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => {
                      setActiveDateField({ id: entry.id, type: 'experience', field: 'endDate' });
                      setShowEndDate(true);
                    }}
                  >
                    <View style={styles.dateInputContent}>
                      <Text style={entry.endDate ? styles.dateText : styles.placeholderText}>
                        {entry.endDate || 'End Date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>

                <InputLabel 
                  label="Job Description"
                  tooltip="Describe your key responsibilities and achievements"
                  showToolTip={true}
                />
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
            {showStartDate && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateSelect}
                maximumDate={new Date()}
              />
            )}
            {showEndDate && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateSelect}
                maximumDate={new Date()}
              />
            )}
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
            
            <InputLabel 
              label="Notice Period"
              tooltip="Current notice period in days"
    
              showToolTip={false}
            />
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

            <InputLabel 
              label="Current CTC"
              tooltip="Your current annual compensation"
      
              showToolTip={false}
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

            <InputLabel 
              label="Expected CTC"
              tooltip="Your expected annual compensation"
    
              showToolTip={false}
            />
            <Controller
              control={control}
              name="expectedCTC"
            
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

            <InputLabel 
              label="Reason for Job Change"
              tooltip="Brief explanation for seeking a new opportunity"
        
              showToolTip={false}
            />
            <Controller
              control={control}
              name="reasonForJobChange"
          
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
            <Text style={styles.stepTitle}>Step 5: Special Achievement</Text>
             <InputLabel 
              label="Achievements"
              tooltip="Highlight any special achievements or projects"
              // required
              showToolTip={true}
            />
            <Controller
              control={control}
              name="achievement"
          
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Achievements"
                  placeholderTextColor="#666"
                  value={formValues.achievement}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
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
                  ? `Selected: ${resumeFile?.name}`
                  : 'Upload Resume (PDF, DOC, DOCX — Max: 5MB)'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.checkboxContainer}>
              <Controller
                control={control}
                name="termsAccepted"
                rules={{ 
                  required: 'You must accept the terms and conditions' 
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View>
                    <TouchableOpacity
                      style={[
                        styles.checkbox, 
                        value && styles.checkboxChecked,
                        error && styles.checkboxError
                      ]}
                      onPress={() => onChange(!value)}
                    >
                      <Ionicons 
                        name={value ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={value ? "#1dbf73" : "#6c757d"} 
                      />
                      <Text style={styles.checkboxText}>
                        I agree to the Terms and Privacy Policy
                      </Text>
                    </TouchableOpacity>
                    {error && (
                      <Text style={styles.errorText}>
                        {error.message}
                      </Text>
                    )}
                  </View>
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
          {job.company?.userId?.name || 'Company Name'}
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
            style={[
              styles.button,
              styles.submitButton,
              isSubmitting && styles.disabledButton
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
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
  checkboxError: {
    borderColor: '#dc3545',
    borderWidth: 1,
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
  dateText: {
    color: '#212529',
    fontSize: 12,
    flex: 1, 
    marginRight: 8, 
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 12,
    flex: 1, 
    marginRight: 8, 
  },
  dateInput: {
    flex: 0.48,
    height: 48,
    padding: 0, 
  },
  dateInputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#212529',
    marginRight: 8,
    fontWeight: '200',
    opacity: 0.8,
  },
  requiredStar: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  tooltipText: {
    fontSize: 8,
    color: '#111',
    padding: 8,
    maxWidth: 200,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 16,
  },
  tooltipButton: {
    padding: 4,
    marginLeft: 4,
  },
});