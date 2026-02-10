import client from './client';

export const onboardingAPI = {
  // Step 1: Personal Info
  submitPersonalInfo: async (data) => {
    const response = await client.post('/onboarding/personal-info', data);
    return response.data;
  },

  // Step 2: Vehicle Info (with optional vehicle images)
  submitVehicleInfo: async (formData) => {
    const response = await client.post('/onboarding/vehicle-info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Step 3: Upload Documents
  uploadDocuments: async (formData) => {
    const response = await client.post('/onboarding/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Step 4: Upload Selfies
  uploadSelfies: async (formData) => {
    const response = await client.post('/onboarding/upload-selfies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Step 5: Submit for Approval
  submitForApproval: async () => {
    const response = await client.post('/onboarding/submit');
    return response.data;
  },

  // Get Status
  getStatus: async () => {
    const response = await client.get('/onboarding/status');
    return response.data;
  },
};