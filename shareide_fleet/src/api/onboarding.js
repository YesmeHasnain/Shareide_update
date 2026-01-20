import client from './client';

export const onboardingAPI = {
  // Step 1: Personal Info
  submitPersonalInfo: async (data) => {
    return await client.post('/onboarding/personal-info', data);
  },

  // Step 2: Vehicle Info
  submitVehicleInfo: async (data) => {
    return await client.post('/onboarding/vehicle-info', data);
  },

  // Step 3: Upload Documents
  uploadDocuments: async (formData) => {
    return await client.post('/onboarding/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Step 4: Upload Selfies
  uploadSelfies: async (formData) => {
    return await client.post('/onboarding/upload-selfies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Step 5: Submit for Approval
  submitForApproval: async () => {
    return await client.post('/onboarding/submit');
  },

  // Get Status
  getStatus: async () => {
    return await client.get('/onboarding/status');
  },
};