import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFuse} from 'react-native-fuse-connect';

const BACKEND_URL = 'http://localhost:8080';

function App(): JSX.Element {
  const [clientSecret, setClientSecret] = useState('');

  const {open, ready} = useFuse({
    clientSecret: clientSecret,
    onInstitutionSelected: async (institutionId: string, clientSecret) => {
      const response = await backendFetch('/create-link-token', 'POST', {
        user_id: 'user1234',
        institution_id: institutionId,
        client_secret: clientSecret,
      });
      return response['link_token'];
    },

    onSuccess: async (publicToken: string) => {
      await backendFetch('/exchange-public-token', 'POST', {
        public_token: publicToken,
      });
      setClientSecret('');
    },
    onExit: () => {
      setClientSecret('');
    },
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready]);

  const backendFetch = async (
    endpoint: string,
    method: string = 'POST',
    body?: any,
  ) => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    const url = `${BACKEND_URL}${endpoint}`;

    const response = await fetch(url, options);

    const responseBody = await response.json();

    console.log('Backend Fetch Response', url, responseBody);

    return responseBody;
  };

  const handleLinkAccountPress = async () => {
    const response = await backendFetch('/create-session', 'POST', {
      user_id: 'user1234',
      is_web_view: false,
    });

    setClientSecret(response['client_secret']);
  };

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.background.backgroundColor}
      />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleLinkAccountPress}
          style={styles.button}>
          <Text style={styles.buttonText}>Link your Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'white',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default App;
