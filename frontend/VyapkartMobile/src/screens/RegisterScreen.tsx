// /src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { registerWithEmail } from '../services/firebaseAuth.service';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      await registerWithEmail(email, password);
      Alert.alert(
        'Success',
        'Verification email sent. Please verify before login.'
      );
    } catch (err: any) {
      Alert.alert('Register failed', err.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Create Account" onPress={onRegister} />
    </View>
  );
}
