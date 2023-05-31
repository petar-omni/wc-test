/**
 * @format
 */
import '@walletconnect/react-native-compat';
import '@ethersproject/shims';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer');
}

AppRegistry.registerComponent(appName, () => App);
