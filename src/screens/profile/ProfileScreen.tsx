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
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { logout, updateProfile,fetchUserProfile } from '../../redux/authSlice';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

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



const ProfileScreen = () => {
  const dispatch = useAppDispatch();

  const { user, loading } = useAppSelector(state => state.auth);

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
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    userProfile?.education || []
  );
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(
    userProfile?.experience || []
  );
  const [isAnimating, setIsAnimating] = useState(false);

 

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
  console.log(formData, "formData")

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
        updatedData.experienceEntries = experienceEntries;
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
      
      if (!result.canceled) {
        const fileInfo = result.assets[0];
        if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }
        
        await dispatch(updateProfile({
          ...user,
          resume: {
            name: fileInfo.name,
            uri: fileInfo.uri,
            type: fileInfo.mimeType || 'application/pdf',
            size: fileInfo.size || 0,
          },
        }));
        Alert.alert('Success', 'Resume uploaded successfully');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to upload resume');
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

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        // Update profile with new image
        try {
          await dispatch(updateProfile({
            ...user,
            profileImage: imageUri,
          })).unwrap();
          Alert.alert('Success', 'Profile image updated successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to update profile image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addEducationEntry = () => {
    const newEntry: EducationEntry = {
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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
      {educationEntries.map((entry) => (
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
            placeholder="Degree/Certification"
            editable={editingSection === 'education'}
          />
          
          <TextInput
            style={styles.input}
            value={entry.institution}
            onChangeText={(text) => updateEducationEntry(entry.id, 'institution', text)}
            placeholder="Institution Name"
            editable={editingSection === 'education'}
          />
          
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={entry.startDate}
              onChangeText={(text) => updateEducationEntry(entry.id, 'startDate', text)}
              placeholder="Start Date"
              editable={editingSection === 'education'}
            />
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={entry.endDate}
              onChangeText={(text) => updateEducationEntry(entry.id, 'endDate', text)}
              placeholder="End Date"
              editable={editingSection === 'education'}
            />
          </View>
        </View>
      ))}

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
      {experienceEntries.map((entry) => (
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
            value={entry.companyName}
            onChangeText={(text) => updateExperienceEntry(entry.id, 'companyName', text)}
            placeholder="Company Name"
            editable={editingSection === 'education'}
          />
          
          <TextInput
            style={styles.input}
            value={entry.jobTitle}
            onChangeText={(text) => updateExperienceEntry(entry.id, 'jobTitle', text)}
            placeholder="Job Title"
            editable={editingSection === 'education'}
          />
          
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={entry.startDate}
              onChangeText={(text) => updateExperienceEntry(entry.id, 'startDate', text)}
              placeholder="Start Date"
              editable={editingSection === 'education'}
            />
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={entry.endDate}
              onChangeText={(text) => updateExperienceEntry(entry.id, 'endDate', text)}
              placeholder="End Date"
              editable={editingSection === 'education'}
            />
          </View>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            value={entry.description}
            onChangeText={(text) => updateExperienceEntry(entry.id, 'description', text)}
            placeholder="Job Description"
            multiline
            numberOfLines={4}
            editable={editingSection === 'education'}
          />
        </View>
      ))}

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
            activeOpacity={0.8}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {renderSection('Basic Information', 'basic', (
        <View>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={user.name}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            // editable={editingSection === 'basic'}
            editable={false}
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
            placeholder="Write a brief summary of your professional background"
          />
        </View>
      ))}

      {renderSection('Contact Details', 'contact', (
        <View>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.mobileNumber}
            onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
            // editable={editingSection === 'contact'}
            editable={false}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Current Location</Text>
          <TextInput
            style={styles.input}
            value={formData.currentLocation}
            onChangeText={(text) => setFormData({ ...formData, currentLocation: text })}
            editable={editingSection === 'contact'}
            placeholder="City, State"
          />

          <Text style={styles.label}>Preferred Job Location</Text>
          <TextInput
            style={styles.input}
            value={formData.preferredWorkLocation}
            onChangeText={(text) => setFormData({ ...formData, preferredWorkLocation: text })}
            editable={editingSection === 'contact'}
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
            placeholder="Enter notice period"
          />

          <Text style={styles.label}>Current CTC (₹ LPA)</Text>
          <TextInput
            style={styles.input}
            value={formData.currentCTC}
            onChangeText={(text) => setFormData({ ...formData, currentCTC: text })}
            editable={editingSection === 'preferences'}
            keyboardType="numeric"
            placeholder="Enter current CTC"
          />

          <Text style={styles.label}>Expected CTC (₹ LPA)</Text>
          <TextInput
            style={styles.input}
            value={formData.expectedCTC}
            onChangeText={(text) => setFormData({ ...formData, expectedCTC: text })}
            editable={editingSection === 'preferences'}
            keyboardType="numeric"
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
            placeholder="Enter your reason for job change"
          />
        </View>
      ))}

      {renderSection('Resume', 'resume', (
        <View>
          {user.resume ? (
            <View style={styles.resumeInfo}>
              <Ionicons name="document" size={24} color="#1dbf73" />
              <Text style={styles.resumeText}>{user.resume.name}</Text>
            </View>
          ) : (
            <Text style={styles.noResumeText}>No resume uploaded</Text>
          )}
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickResume}
          >
            <Text style={styles.uploadButtonText}>
              {user.resume ? 'Update Resume' : 'Upload Resume'}
            </Text>
            <Text style={styles.uploadSubtext}>
              PDF/DOC/DOCX — Max: 5MB
            </Text>
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
    marginLeft: 8,
    color: '#2d3436',
    fontSize: 14,
    flex: 1,
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
});

export default ProfileScreen;