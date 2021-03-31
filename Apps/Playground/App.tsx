/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/**
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React, { useState, FunctionComponent, useEffect, useCallback, useRef } from 'react';
 import { SafeAreaView, View, ViewProps, StyleSheet } from 'react-native';
 
 import { EngineView, useEngine } from '@babylonjs/react-native';
 import * as BABYLON from '@babylonjs/core';
 import { NavBar } from "./components/NavBar";
 import { sceneCookie, SampleScene } from './SampleScene';
 const earcut = require('earcut');
 
 const EngineScreen: FunctionComponent<ViewProps> = (props: ViewProps) => {
   const engine = useEngine();
   const [camera, setCamera] = useState<BABYLON.ArcRotateCamera>();
   const sampleScene = useRef<SampleScene>();
   const sampleCookie = useRef<number>(sceneCookie);
 
   useEffect(() => {
     if (engine) {
       initializeScene();
       }
   }, [engine, sampleCookie]);
 
   const initializeScene = async () => {
     if (engine) {
       sampleScene.current = new SampleScene(engine);
       sampleScene.current.earcut = earcut;
       await sampleScene.current.initializeSceneAsync();
 
       // Pull all of the member variables out into our useRefs.
       setCamera(sampleScene.current.camera);
     }
   };
 
   const resetClick = () => {
     if (sampleScene.current) {
       sampleScene.current.resetClick();
     }
   };
 
   const onToggleXr = () => {
     if (sampleScene.current)
     {
       sampleScene.current.onToggleXr();
     }
   };
 
   return (
     <>
       <SafeAreaView style={props.style}>
         <NavBar resetClickHandler={resetClick} backClickHandler={onToggleXr} />
         <View style={{flex: 1}}>
           <EngineView style={props.style} camera={camera} displayFrameRate={false} />
         </View>
       </SafeAreaView>
     </>
   );
 };
 
 const App = () => {
   return (
     <>
         <EngineScreen style={{flex: 1, zIndex: 0}} />
     </>
   );
 };
 
 export default App;
