import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Dimensions,
  Animated,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { logout, updateProfile, fetchUserProfile } from '../../redux/authSlice';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { uploadToCloudinary, getViewableUrl } from '../../utils/cloudinary';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type Section = 'basic' | 'contact' | 'education' | 'preferences' | 'skills' | 'resume';

type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
};

type ExperienceEntry = {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

const EDUCATION_OPTIONS = [
  'High School',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Ph.D.',
  'Other',
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const ProfileScreen = () => {
  const dispatch = useAppDispatch();

  const { user, loading } = useAppSelector(state => state.auth);
  const [isOpeningResume, setIsOpeningResume] = useState(false);

  const userProfile = useAppSelector((state: RootState) => state.auth.userProfile);

  // Fetch profile on component mount if not available
  useEffect(() => {
    if (user && !userProfile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user, userProfile]);

  const [expandedSection, setExpandedSection] = useState<Section | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [animations] = useState({
    basic: new Animated.Value(0),
    contact: new Animated.Value(0),
    education: new Animated.Value(0),
    preferences: new Animated.Value(0),
    skills: new Animated.Value(0),
    resume: new Animated.Value(0),
  });
  const [profileImage, setProfileImage] = useState(userProfile?.image?.url || null);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(() => {
    if (userProfile?.education && userProfile.education.length > 0) {
      return userProfile.education.map(edu => ({
        id: generateId(),
        degree: edu.degree || '',
        institution: edu.institution || '',
        startDate: edu.startDate ? format(new Date(edu.startDate), 'MMM yyyy') : '',
        endDate: edu.endDate ? format(new Date(edu.endDate), 'MMM yyyy') : '',
      }));
    }
    return [{
      id: generateId(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    }];
  });
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(
    userProfile?.experience || []
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState<{
    type: 'education' | 'experience';
    id: string;
    field: 'startDate' | 'endDate';
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    headline: userProfile?.headline || '',
    summary: userProfile?.summary || '',
    mobileNumber: user?.phone || '',
    currentLocation: userProfile?.currentLocation || '',
    preferredWorkLocation: userProfile?.preferredWorkLocation || '',
    totalExperience: userProfile?.totalExperience || '',
    relevantExperience: userProfile?.relevantExperience || '',
    currentCompany: userProfile?.currentCompany || '',
    currentJobTitle: userProfile?.currentJobTitle || '',
    noticePeriod: userProfile?.noticePeriod || '',
    currentCTC: userProfile?.currentCTC || '',
    expectedCTC: userProfile?.expectedCTC || '',
    reasonForChange: userProfile?.reasonForJobChange || '',
    skills: userProfile?.skills?.join(', ') || '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: user?.name || '',
        headline: userProfile.headline || '',
        summary: userProfile.summary || '',
        mobileNumber: user?.phone || '',
        currentLocation: userProfile.currentLocation || '',
        preferredWorkLocation: userProfile.preferredWorkLocation || '',
        totalExperience: userProfile.totalExperience || '',
        relevantExperience: userProfile.relevantExperience || '',
        currentCompany: userProfile.currentCompany || '',
        currentJobTitle: userProfile.currentJobTitle || '',
        noticePeriod: userProfile.noticePeriod?.toString() || '',
        currentCTC: userProfile.currentCTC?.toString() || '',
        expectedCTC: userProfile.expectedCTC?.toString() || '',
        reasonForChange: userProfile.reasonForJobChange || '',
        skills: userProfile.skills?.join(', ') || '',
      });
    }
  }, [userProfile, user]);
  // console.log(formData, "formData")

  const toggleSection = (section: Section) => {
    if (isAnimating) return; // Prevent toggle while animating
    setIsAnimating(true);

    if (expandedSection === section) {
      // Closing current section
      Animated.timing(animations[section], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setExpandedSection(null);
        setEditingSection(null);
        setIsAnimating(false);
      });
    } else {
      // If there's a section already open, close it first
      if (expandedSection) {
        Animated.timing(animations[expandedSection], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      // Open new section
      setExpandedSection(section);
      Animated.timing(animations[section], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
      setEditingSection(null);
    }
  };

  const toggleEdit = (section: Section) => {
    if (editingSection === section) {
      setEditingSection(null);
    } else {
      setEditingSection(section);
      setExpandedSection(section);
    }
  };

  const handleSave = async (section: Section) => {
    try {
      const updatedData: any = { id: user?.id };
      
      if (section === 'basic') {
        updatedData.name = formData.fullName;
        updatedData.headline = formData.headline;
        updatedData.summary = formData.summary;
      } else if (section === 'contact') {
        // updatedData.phone = formData.mobileNumber;
        updatedData.currentLocation = formData.currentLocation;
        updatedData.preferredWorkLocation = formData.preferredWorkLocation;
      } else if (section === 'education') {
        updatedData.education = educationEntries;
        updatedData.experience = experienceEntries;
      } else if (section === 'preferences') {
        updatedData.noticePeriod = formData.noticePeriod;
        updatedData.currentCTC = formData.currentCTC;
        updatedData.expectedCTC = formData.expectedCTC;
        updatedData.reasonForJobChange = formData.reasonForChange;
      } else if (section === 'skills') {
        updatedData.skills = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
      }

      await dispatch(updateProfile(updatedData)).unwrap();
      setEditingSection(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileInfo = result.assets[0];
        
        if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setIsUploadingResume(true);
        try {
          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(fileInfo.uri, 'raw');
          console.log('Resume upload response:', cloudinaryResponse);

          if (cloudinaryResponse) {
            // Update profile with Cloudinary data
            await dispatch(updateProfile({
              ...userProfile,
              resume: {
                url: cloudinaryResponse.secure_url,
                name: fileInfo.name,
                public_id: cloudinaryResponse.public_id,
                extension: cloudinaryResponse.format || fileInfo.name.split('.').pop() || 'pdf'
              }
            })).unwrap();
            
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

  const handleOpenResume = async () => {
    try {
      const fileUrl = userProfile?.resume?.url;
  
      if (!fileUrl) {
        Alert.alert('Error', 'No resume found');
        return;
      }
  
      setIsOpeningResume(true);
  
      // Ensure Cloudinary link uses fl_attachment (if applicable)
      const isCloudinary = fileUrl.includes('res.cloudinary.com');
      const cleanUrl = isCloudinary
        ? fileUrl.replace('/upload/', '/upload/fl_attachment/')
        : fileUrl;
  
      const options = [
        {
          name: 'Direct Download',
          handler: async () => {
            const supported = await Linking.canOpenURL(cleanUrl);
            if (supported) {
              await Linking.openURL(cleanUrl);
            } else {
              throw new Error('Cannot open direct URL');
            }
          }
        },
        {
          name: 'Google Docs Viewer',
          handler: async () => {
            const url = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(cleanUrl)}`;
            await WebBrowser.openBrowserAsync(url);
          }
        }
      ];
  
      Alert.alert(
        'Open Resume',
        'Choose how you would like to view the resume:',
        [
          ...options.map(option => ({
            text: option.name,
            onPress: async () => {
              try {
                await option.handler();
              } catch (error) {
                console.error(`Error with ${option.name}:`, error);
                Alert.alert(
                  'Failed to Open',
                  `Could not open with ${option.name}. Try direct download instead?`,
                  [
                    {
                      text: 'Download',
                      onPress: async () => {
                        try {
                          await Linking.openURL(cleanUrl);
                        } catch (e) {
                          Alert.alert('Error', 'Failed to download file.');
                        }
                      }
                    },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }
            }
          })),
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Resume open error:', error);
      Alert.alert('Error', 'Failed to open resume.');
    } finally {
      setIsOpeningResume(false);
    }
  };
  

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ]
    );
  };

  const animateSection = (expanded: boolean) => {
    Animated.spring(animation, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: true,
    }).start();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload an image.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
  
      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        try {
          const imageUri = result.assets[0].uri;
          const filename = imageUri.split('/').pop() || 'image.jpg';
          
          // Create file object for upload
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
          } as any);
          
          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(imageUri, 'image');
          console.log('Cloudinary response:', cloudinaryResponse);
  
          if (cloudinaryResponse) {
            // Update local state
            setProfileImage(cloudinaryResponse.secure_url);
            
            // Update profile with Cloudinary URL
            await dispatch(updateProfile({
              ...userProfile,
              image: {
                url: cloudinaryResponse.secure_url,
                name: filename,
                extension: 'jpg'
              }
            })).unwrap();
            
            Alert.alert('Success', 'Profile image updated successfully');
          }
        } catch (error: any) {
          console.error('Upload error:', error);
          Alert.alert(
            'Error',
            error?.message || 'Failed to upload image. Please try again.'
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addEducationEntry = () => {
    const newEntry: EducationEntry = {
      id: generateId(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: ''
    };
    setEducationEntries([...educationEntries, newEntry]);
  };

  const updateEducationEntry = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEducationEntry = (id: string) => {
    setEducationEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const addExperienceEntry = () => {
    const newEntry: ExperienceEntry = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setExperienceEntries([...experienceEntries, newEntry]);
  };

  const updateExperienceEntry = (id: string, field: keyof ExperienceEntry, value: string) => {
    setExperienceEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeExperienceEntry = (id: string) => {
    setExperienceEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const handleDatePress = (type: 'education' | 'experience', id: string, field: 'startDate' | 'endDate') => {
    if (editingSection === 'education') {
      setDateType({ type, id, field });
      setShowDatePicker(true);
    }
  };

  const onDateChange = (event: any, selected: Date | undefined) => {
    setShowDatePicker(false);
    
    if (selected && dateType) {
      // Format date as "MMM yyyy" (e.g., "Jan 2024")
      const formattedDate = format(selected, 'MMM yyyy');
      
      if (dateType.type === 'education') {
        updateEducationEntry(dateType.id, dateType.field, formattedDate);
      } else {
        updateExperienceEntry(dateType.id, dateType.field, formattedDate);
      }
    }
    setDateType(null);
  };

  const renderEducationEntry = (entry: EducationEntry) => (
    <View key={entry.id} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>Education Entry</Text>
        {editingSection === 'education' && (
          <TouchableOpacity
            onPress={() => removeEducationEntry(entry.id)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={24} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>
      
      <TextInput
        style={styles.input}
        value={entry.degree}
        onChangeText={(text) => updateEducationEntry(entry.id, 'degree', text)}
         placeholderTextColor="#666"
        placeholder="Degree/Certification"
        editable={editingSection === 'education'}
      />
      
      <TextInput
        style={styles.input}
        value={entry.institution}
        onChangeText={(text) => updateEducationEntry(entry.id, 'institution', text)}
         placeholderTextColor="#666"
        placeholder="Institution Name"
        editable={editingSection === 'education'}
      />
      
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={[styles.input, styles.dateInput]}
          onPress={() => handleDatePress('education', entry.id, 'startDate')}
          disabled={editingSection !== 'education'}
        >
          <Text style={[
            styles.dateText,
            !entry.startDate && styles.placeholderText
          ]}>
            {entry.startDate || 'Start Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.input, styles.dateInput]}
          onPress={() => handleDatePress('education', entry.id, 'endDate')}
          disabled={editingSection !== 'education'}
        >
          <Text style={[
            styles.dateText,
            !entry.endDate && styles.placeholderText
          ]}>
            {entry.endDate || 'End Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExperienceEntry = (entry: ExperienceEntry) => (
    <View key={entry.id} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>Work Experience Entry</Text>
        {editingSection === 'education' && (
          <TouchableOpacity
            onPress={() => removeExperienceEntry(entry.id)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={24} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>
      
      <TextInput
        style={styles.input}
        value={entry.company}
        onChangeText={(text) => updateExperienceEntry(entry.id, 'company', text)}
         placeholderTextColor="#666"
        placeholder="Company Name"
        editable={editingSection === 'education'}
      />
      
      <TextInput
        style={styles.input}
        value={entry.title}
        onChangeText={(text) => updateExperienceEntry(entry.id, 'title', text)}
         placeholderTextColor="#666"
        placeholder="Job Title"
        editable={editingSection === 'education'}
      />
      
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={[styles.input, styles.dateInput]}
          onPress={() => handleDatePress('experience', entry.id, 'startDate')}
          disabled={editingSection !== 'education'}
        >
          <Text style={[
            styles.dateText,
            !entry.startDate && styles.placeholderText
          ]}>
            {entry.startDate || 'Start Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.input, styles.dateInput]}
          onPress={() => handleDatePress('experience', entry.id, 'endDate')}
          disabled={editingSection !== 'education'}
        >
          <Text style={[
            styles.dateText,
            !entry.endDate && styles.placeholderText
          ]}>
            {entry.endDate || 'End Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        value={entry.description}
        onChangeText={(text) => updateExperienceEntry(entry.id, 'description', text)}
         placeholderTextColor="#666"
        placeholder="Job Description"
        multiline
        numberOfLines={4}
        editable={editingSection === 'education'}
      />
    </View>
  );

  const renderSection = (
    title: string,
    section: Section,
    children: React.ReactNode,
  ) => {
    const isExpanded = expandedSection === section;
    const isEditing = editingSection === section;

    return (
      <Animated.View style={[styles.section, {
        transform: [{
          scale: animations[section].interpolate({
            inputRange: [0, 1],
            outputRange: [0.98, 1],
          }),
        }],
      }]}>
        <TouchableOpacity
          style={[styles.sectionHeader, isExpanded && styles.expandedHeader]}
          onPress={() => toggleSection(section)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionActions}>
            {isExpanded && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => toggleEdit(section)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <Animated.View 
            style={[
              styles.sectionContent,
              {
                opacity: animations[section],
                transform: [{
                  translateY: animations[section].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            {children}
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSave(section)}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderEducationExperienceSection = () => (
    <View>
      <Text style={styles.sectionSubtitle}>Education</Text>
      {educationEntries.map((entry) => renderEducationEntry(entry))}

      {editingSection === 'education' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={addEducationEntry}
        >
          <Ionicons name="add-circle" size={24} color="#1dbf73" />
          <Text style={styles.addButtonText}>Add Education</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Work Experience</Text>
      {experienceEntries.map((entry) => renderExperienceEntry(entry))}

      {editingSection === 'education' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={addExperienceEntry}
        >
          <Ionicons name="add-circle" size={24} color="#1dbf73" />
          <Text style={styles.addButtonText}>Add Work Experience</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  if (!user) return null;

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={pickImage}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <View style={styles.avatar}>
                <ActivityIndicator size="large" color="#1dbf73" />
              </View>
            ) : profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.avatarImage}
                // defaultSource={require('../../assets/default-avatar.png')}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons 
                name={isUploading ? "hourglass" : "camera"} 
                size={14} 
                color="#fff" 
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {renderSection('Basic Information', 'basic', (
        <View>
          <Text style={styles.label}>Full Name (Non-editable)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user.name}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            // editable={editingSection === 'basic'}
            editable={false}
             placeholderTextColor="#666"
            placeholder="Enter your full name"
          />

          <Text style={styles.label}>Email (Non-editable)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user.email}
            editable={false}
          />

          <Text style={styles.label}>Professional Headline</Text>
          <TextInput
            style={styles.input}
            value={formData.headline}
            onChangeText={(text) => setFormData({ ...formData, headline: text })}
            editable={editingSection === 'basic'}
             placeholderTextColor="#666"
            placeholder="e.g., Senior Software Engineer"
          />

          <Text style={styles.label}>Professional Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.summary}
            onChangeText={(text) => setFormData({ ...formData, summary: text })}
            editable={editingSection === 'basic'}
            multiline
            numberOfLines={4}
           placeholderTextColor="#666"
            placeholder="Write a brief summary of your professional background"
          />
        </View>
      ))}

      {renderSection('Contact Details', 'contact', (
        <View>
          <Text style={styles.label}>Phone Number (Non-editable)</Text>
          <TextInput
              style={[styles.input, styles.disabledInput]}
            value={formData.mobileNumber}
            onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
            // editable={editingSection === 'contact'}
            editable={false}
             placeholderTextColor="#666"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Current Location</Text>
          <TextInput
            style={styles.input}
            value={formData.currentLocation}
            onChangeText={(text) => setFormData({ ...formData, currentLocation: text })}
            editable={editingSection === 'contact'}
             placeholderTextColor="#666"
            placeholder="City, State"
          />

          <Text style={styles.label}>Preferred Job Location</Text>
          <TextInput
            style={styles.input}
            value={formData.preferredWorkLocation}
            onChangeText={(text) => setFormData({ ...formData, preferredWorkLocation: text })}
            editable={editingSection === 'contact'}
             placeholderTextColor="#666"
            placeholder="Enter preferred job location"
          />
        </View>
      ))}

      {renderSection('Education & Experience', 'education', (
        renderEducationExperienceSection()
      ))}

      {renderSection('Preferences', 'preferences', (
        <View>
          <Text style={styles.label}>Notice Period (in days)</Text>
          <TextInput
            style={styles.input}
            value={formData.noticePeriod}
            onChangeText={(text) => setFormData({ ...formData, noticePeriod: text })}
            editable={editingSection === 'preferences'}
            keyboardType="numeric"
             placeholderTextColor="#666"
            placeholder="Enter notice period"
          />

          <Text style={styles.label}>Current CTC (₹ LPA)</Text>
          <TextInput
            style={styles.input}
            value={formData.currentCTC}
            onChangeText={(text) => setFormData({ ...formData, currentCTC: text })}
            editable={editingSection === 'preferences'}
            keyboardType="numeric"
             placeholderTextColor="#666"
            placeholder="Enter current CTC"
          />

          <Text style={styles.label}>Expected CTC (₹ LPA)</Text>
          <TextInput
            style={styles.input}
            value={formData.expectedCTC}
            onChangeText={(text) => setFormData({ ...formData, expectedCTC: text })}
            editable={editingSection === 'preferences'}
            keyboardType="numeric"
             placeholderTextColor="#666"
            placeholder="Enter expected CTC"
          />

          <Text style={styles.label}>Reason for Job Change</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.reasonForChange}
            onChangeText={(text) => setFormData({ ...formData, reasonForChange: text })}
            editable={editingSection === 'preferences'}
            multiline
            numberOfLines={4}
             placeholderTextColor="#666"
            placeholder="Enter your reason for job change"
          />
        </View>
      ))}

      {renderSection('Resume', 'resume', (
        <View>
          {userProfile?.resume ? (
      <View style={styles.resumeInfo}>
        <Ionicons name="document" size={24} color="#1dbf73" />
        <TouchableOpacity 
          onPress={handleOpenResume}
          style={styles.resumeTextContainer}
          disabled={isOpeningResume}
        >
          {isOpeningResume ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1dbf73" />
              <Text style={styles.loadingText}>Opening resume...</Text>
            </View>
          ) : (
            <Text style={[styles.resumeText, styles.resumeLink]}>
              {userProfile.resume.name}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    ) : (
            <Text style={styles.noResumeText}>No resume uploaded</Text>
          )}
          
          <TouchableOpacity
            style={[styles.uploadButton, isUploadingResume && styles.uploadButtonDisabled]}
            onPress={handlePickResume}
            disabled={isUploadingResume}
          >
            {isUploadingResume ? (
              <ActivityIndicator size="small" color="#1dbf73" />
            ) : (
              <>
                <Text style={styles.uploadButtonText}>
                  {userProfile?.resume ? 'Update Resume' : 'Upload Resume'}
                </Text>
                <Text style={styles.uploadSubtext}>
                  PDF/DOC/DOCX — Max: 5MB
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ))}

      {renderSection('Skills', 'skills', (
        <View>
          <Text style={styles.label}>Skills (comma-separated)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.skills}
            onChangeText={(text) => setFormData({ ...formData, skills: text })}
            editable={editingSection === 'skills'}
            multiline
            numberOfLines={4}
             placeholderTextColor="#666"
            placeholder="Enter your skills (e.g., JavaScript, React Native, TypeScript)"
          />
        </View>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#1dbf73',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 36,
    color: '#1dbf73',
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1dbf73',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    color: '#fff',
    // color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 3,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  expandedHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 12,
    backgroundColor: '#e8f7f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#1dbf73',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3436',
    
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1dbf73',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1dbf73',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#1dbf73',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f0fff4',
  },
  uploadButtonText: {
    color: '#1dbf73',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  value: {
    fontSize: 16,
    color: '#2d3436',
    marginBottom: 16,
    padding: 12,
  },
  resumeText: {
    fontSize: 14,
    color: '#2d3436',
  },
  resumeLink: {
    color: '#1dbf73',
    textDecorationLine: 'underline',
  },
  noResumeText: {
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  uploadSubtext: {
    color: '#636e72',
    fontSize: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  entryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  removeButton: {
    padding: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 12,
    color: '#2d3436',
  },
  placeholderText: {
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e8f7f0',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#1dbf73',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  resumeTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default ProfileScreen;