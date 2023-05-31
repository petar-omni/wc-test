/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {handleAuthResponse, handleUri, initialize} from './wc';
import {AuthClientTypes} from '@walletconnect/auth-client';
import {TouchableOpacity} from 'react-native';
import {DevSettings} from 'react-native';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [wcReady, setWcReady] = useState(false);
  const [wcAuthSession, setWcAuthSession] = useState<
    AuthClientTypes.EventArguments['auth_request'] | null
  >(null);
  const [wcUri, setWcUri] = useState<string>('');

  useEffect(() => {
    const unsubscribe = initialize({
      onReady: () => setWcReady(true),
      onAuthRequest: event => {
        console.log('__ON_AUTH_REQUEST__:  ', event);
        setWcAuthSession(event);
      },
    });

    return unsubscribe;
  }, []);

  const onPair = () => {
    if (!wcReady || !wcUri) {
      return;
    }

    handleUri(wcUri);
  };

  const onConnect = () => {
    if (!wcReady || !wcAuthSession) {
      return;
    }

    handleAuthResponse({request: wcAuthSession}).then(onClear);
  };

  const onClear = () => {
    setWcUri('');
    setWcAuthSession(null);
  };

  const onClearStorage = async () => {
    await AsyncStorage.clear();
    DevSettings.reload();
  };

  const onReload = () => {
    DevSettings.reload();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{flexGrow: 1}}>
        <Header />
        <View style={styles.container}>
          <Text style={styles.ready}>
            WC Ready: {wcReady ? 'true' : 'false'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="WC uri"
            onChangeText={text => setWcUri(text)}
            value={wcUri}
          />
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Button title="Clear" onPress={onClear} />
            {!wcAuthSession && <Button title="Pair" onPress={onPair} />}
            {wcAuthSession && (
              <Button title="Reject session" onPress={onConnect} />
            )}
          </View>

          {wcAuthSession && (
            <View>
              <Text>Auth Request:</Text>

              <Text>ID: {wcAuthSession.id}</Text>
              <Text>Topic: {wcAuthSession.topic}</Text>
            </View>
          )}
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, {marginBottom: 10}]}
            onPress={onClearStorage}>
            <Text style={styles.buttonText}>
              Clear async storage and reload
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onReload}>
            <Text style={styles.buttonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderWidth: 1,
    color: 'red',
    backgroundColor: 'red',
    borderColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.white,
  },
  ready: {fontSize: 20, marginBottom: 10},
  input: {
    fontSize: 20,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default App;
