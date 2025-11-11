import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function Index() {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingFinish = () => {
    setShowLoading(false);
    // Navigate to login screen after loading
    router.replace('/auth/login');
  };

  if (showLoading) {
    return <LoadingScreen onFinish={handleLoadingFinish} />;
  }

  return null;
}
