import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import { Engine, NativeEngine, WebXRSessionManager } from '@babylonjs/core';
import { BabylonModule } from './BabylonModule';
import { DisposeEngine } from './EngineHelpers';
import * as base64 from 'base-64';

// These are errors that are normally thrown by WebXR's requestSession, so we should throw the same errors under similar circumstances so app code can be written the same for browser or native.
// https://developer.mozilla.org/en-US/docs/Web/API/XRSystem/requestSession
// https://developer.mozilla.org/en-US/docs/Web/API/DOMException#Error_names
enum DOMError {
    NotSupportedError = 9,
    InvalidStateError = 11,
    SecurityError = 18,
}

class DOMException {
    public constructor(private readonly error: DOMError) { }
    get code(): number { return this.error; }
    get name(): string { return DOMError[this.error]; }
}

// Override the WebXRSessionManager.initializeSessionAsync to insert a camera permissions request. It would be cleaner to do this directly in the native XR implementation, but there are a couple problems with that:
// 1. React Native does not provide a way to hook into the permissions request result (at least on Android).
// 2. If it is done on the native side, then we need one implementation per platform.
{
    const originalInitializeSessionAsync: (...args: any[]) => Promise<any> = WebXRSessionManager.prototype.initializeSessionAsync;
    WebXRSessionManager.prototype.initializeSessionAsync = async function (...args: any[]): Promise<any> {
        console.log("WebXRSessionManager.initializeSessionAsync called");
        // try {
        //     const cameraPermission = Platform.select({
        //         android: PERMISSIONS.ANDROID.CAMERA,
        //         ios: PERMISSIONS.IOS.CAMERA,
        //         windows: undefined
        //     });
    
        //     if (cameraPermission === undefined) {
        //         // TODO determine whether other platforms need this permission
        //         console.log("No permission found for camera access on current platform when attempting to enter xr session");
        //         return originalInitializeSessionAsync.apply(this, args);
        //     } else {
        //         // If the permission has not been granted yet, but also not been blocked, then request permission.
        //         let permissionStatus = await check(cameraPermission);
        //         if (permissionStatus == "denied") {
        //             permissionStatus = await request(cameraPermission);
        //         }
    
        //         // If the permission has still not been granted, then throw an appropriate exception, otherwise continue with the actual XR session initialization.
        //         switch (permissionStatus) {
        //             case "unavailable":
        //                 throw new DOMException(DOMError.NotSupportedError);
        //             case "denied":
        //             case "blocked":
        //                 throw new DOMException(DOMError.SecurityError);
        //             case "granted":
        //                 return originalInitializeSessionAsync.apply(this, args);
        //         }
        //     }
        // } catch (error) {
        //     console.log("error thrown attempting to setup xr session" + error.stack);
        // }

        return originalInitializeSessionAsync.apply(this, args);
    }
}

// Babylon Native includes a native atob polyfill, but it relies JSI to deal with the strings, and JSI has a bug where it assumes strings are null terminated, and a base 64 string can contain one of these.
// So for now, provide a JavaScript based atob polyfill.
console.log("Declaring global");
declare const global: any;
global.atob = base64.decode;
console.log("global:" + global);

console.log("Declaring useEngine");
export function useEngine(): Engine | undefined {
    try {
        console.log("Calling useEngine");
        const [engine, setEngine] = useState<Engine>();
    
        useEffect(() => {
            console.log("using effect for useEngine");
            let disposed = false;
            let engine: Engine | undefined = undefined;
    
            (async () => {
                if (await BabylonModule.initialize() && !disposed)
                {
                    console.log("BabylonModule completed initialization");
                    console.log("Creating engine");
                    engine = BabylonModule.createEngine();
                    console.log("Setting engine");
                    setEngine(engine);
                    console.log("Engine set");
                }
            })();
    
            return () => {
                console.log("Calling useEngine returned function");
                disposed = true;
                // NOTE: Do not use setEngine with a callback to dispose the engine instance as that callback does not get called during component unmount when compiled in release.
                if (engine) {
                    DisposeEngine(engine);
                }
                setEngine(undefined);
            };
        }, []);
    
        console.log("Returning engine from useEngine");
        return engine;
    } catch (error)
    {
        console.log(error.stack);
        throw error;
    }
}
console.log("useEngine:" + useEngine);