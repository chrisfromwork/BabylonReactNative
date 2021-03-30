  
/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import * as BABYLON from '@babylonjs/core';
import { MaxBlock, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";
export const sceneCookie = 1;

// To run this code in the playground copy everything after the Export below down
// and uncomment the final lines.
export class SampleScene {
  private engine: BABYLON.Engine;
  scene: BABYLON.Scene | undefined;
  camera: BABYLON.ArcRotateCamera | undefined;
  model: BABYLON.AbstractMesh | undefined;
  placementIndicator: BABYLON.AbstractMesh | undefined;
  targetScale: number = .5;
  appliedScale: number = 1;
  xrSession: BABYLON.WebXRSessionManager | undefined;
  planeTexture: BABYLON.Texture | undefined;
  planeMat: BABYLON.StandardMaterial | undefined;
  modelPlaced: boolean = false;
  deviceSourceManager : BABYLON.DeviceSourceManager | undefined;
  earcut : any | undefined;

  constructor(engine: BABYLON.Engine) {
    this.engine = engine;
  }

  public initializeSceneAsync = async () => {
    // Create the scene.
    this.scene = new BABYLON.Scene(this.engine);

    // Setup the camera.
    this.scene.createDefaultCamera(true);
    this.camera = this.scene.activeCamera as BABYLON.ArcRotateCamera;

    // Set up lighting for the scene
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 5, 0), this.scene);
    light.diffuse = BABYLON.Color3.White();
    light.intensity = 1;
    light.specular = new BABYLON.Color3(0, 0, 0);

    // Create the placement indicator.
    this.placementIndicator = BABYLON.Mesh.CreateTorus("placementIndicator", 0.5, 0.005, 64);
    var indicatorMat = new BABYLON.StandardMaterial('noLight', this.scene);
    indicatorMat.disableLighting = true;
    indicatorMat.emissiveColor = BABYLON.Color3.White();
    this.placementIndicator.material = indicatorMat;
    this.placementIndicator.scaling = new BABYLON.Vector3(1, 0.01, 1);
    this.placementIndicator.setEnabled(false);

    // Import a model.
    //this.model = BABYLON.Mesh.CreateBox("box", 0.3, this.scene);
    // const newModel = await BABYLON.SceneLoader.ImportMeshAsync("", "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF/BoxTextured.gltf");
    // const newModel = await BABYLON.SceneLoader.ImportMeshAsync("", "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF/CesiumMan.gltf");
    const newModel = await BABYLON.SceneLoader.ImportMeshAsync("", "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF/BrainStem.gltf");
    this.model = newModel.meshes[0];

    // Position the model in front of the camera.
    const { min, max } = this.model.getHierarchyBoundingVectors(true, null);

    // Set the target scale to cap the size of the model to targetScale meters tall.
    this.appliedScale = this.targetScale / (max.y - min.y);

    this.camera.position = this.camera.position.add(new Vector3(0, 1.3, 0));
    this.model.position = this.camera.position.add(this.camera.getForwardRay().direction.scale(this.targetScale * 2));
    this.model.scalingDeterminant = 0;
    this.model.lookAt(this.camera.position);
    //this.camera.setTarget(this.model);
    this.camera.beta -= Math.PI / 8;

    // Set up an animation loop to show the cube spinning.
    const startTime = Date.now();
    this.scene.beforeRender = () => {
      if (this.model && this.scene) {
        if (this.model.scalingDeterminant < this.appliedScale) {
          const newScale = this.appliedScale * (Date.now() - startTime) / 500;
          this.model.scalingDeterminant = newScale > this.appliedScale ? this.appliedScale : newScale;
          this.model.markAsDirty("scaling");
        }
        this.model.rotate(BABYLON.Vector3.Up(), 0.005 * this.scene.getAnimationRatio());
      }
    };

    this.planeMat = new BABYLON.StandardMaterial('noLight', this.scene);
    this.planeMat.alpha = .2;

    this.createInputHandling();
  };

  public resetClick = () => {
    if (this.model && this.camera && this.scene && this.placementIndicator) {
      if (this.xrSession)
      {
        this.modelPlaced = false;
        this.model.setEnabled(false);
        this.placementIndicator.setEnabled(true);
      }
      else
      {
        this.placementIndicator?.setEnabled(false);
        this.reset2D();
      }
    }
  }

  // Function that resets the 2D screen state to its original position.
  public reset2D = () => {
    if (this.model && this.scene && this.camera) {
      this.model.setEnabled(true);
      this.model.position = this.camera.position.add(this.camera.getForwardRay().direction.scale(this.targetScale * 4));
      this.model.scalingDeterminant = 0;
      this.camera.setTarget(this.model);
      const startTime = Date.now();
      this.scene.beforeRender = () => {
        if (this.model && this.scene) {
          if (this.model.scalingDeterminant < this.appliedScale) {
            const newScale = this.appliedScale * (Date.now() - startTime) / 500;
            this.model.scalingDeterminant = newScale > this.appliedScale ? this.appliedScale : newScale;
            this.model.markAsDirty("scaling");
          }

          this.model.rotate(BABYLON.Vector3.Up(), 0.005 * this.scene.getAnimationRatio());
        }
      };
    }
  };

  placeModel = () => {
    if (this.xrSession && this.placementIndicator?.isEnabled() && this.scene && this.model)
    {
      this.modelPlaced = true;
      this.model.rotationQuaternion = BABYLON.Quaternion.Identity();
      this.placementIndicator.setEnabled(false);

      this.model.setEnabled(true);
      this.model.position = this.placementIndicator.position.clone();
      const { min } = this.model.getHierarchyBoundingVectors(true);
      this.model.position.y += this.model.getAbsolutePosition().y - min.y;
      this.model.scalingDeterminant = 0;

      const startTime = Date.now();
      this.scene.beforeRender = () => {
        if (this.model && this.model.scalingDeterminant < this.appliedScale) {
          const newScale = this.appliedScale * (Date.now() - startTime) / 500;
          this.model.scalingDeterminant = newScale > this.appliedScale ? this.appliedScale : newScale;
          this.model.markAsDirty("scaling");
        }
      };
    }
  };

  private createInputHandling = () => {
    if (this.engine && this.scene) {
      if (!this.deviceSourceManager) {
        this.deviceSourceManager = new BABYLON.DeviceSourceManager(this.engine);
      }

      this.deviceSourceManager.onDeviceConnectedObservable.clear();
      this.deviceSourceManager.onDeviceDisconnectedObservable.clear();

      var numInputs = 0;

      // Bind touch event.
      this.deviceSourceManager.onDeviceConnectedObservable.add(deviceEventData => {
        numInputs++;

        // Identify the touch event ID that was just added, and bind to its update event.
        this.deviceSourceManager?.getDeviceSource(deviceEventData.deviceType, deviceEventData.deviceSlot)?.onInputChangedObservable.add(inputEventData => {
          if (inputEventData && this.model && this.modelPlaced && this.xrSession && inputEventData.previousState !== null && inputEventData.previousState !== 0 && inputEventData.currentState !== null && inputEventData.currentState !== 0) {
            // Calculate the differential between two states.
            const diff = inputEventData.previousState - inputEventData.currentState;

            // Single input, do translation.
            if (numInputs === 1) {
              if (inputEventData.inputIndex === BABYLON.PointerInput.Horizontal)
              {
                this.model.position.x -= diff / 1000;
              }
              else
              {
                this.model.position.z += diff / 750;
              }
            }
            // Multi-input do rotation.
            else if (numInputs === 2 && inputEventData.inputIndex === BABYLON.PointerInput.Horizontal && deviceEventData.deviceSlot === 0) {
              this.model.rotate(BABYLON.Vector3.Up(), diff / 200);
            }
          }
        });

        this.placeModel();
      });

      this.deviceSourceManager.onDeviceDisconnectedObservable.add(_deviceEventData => {
        numInputs--;
      });
    }
  }

  onToggleXr = async () => {
      if (this.xrSession) {
        this.model?.setEnabled(false);
        this.placementIndicator?.setEnabled(false);

        await this.xrSession.exitXRAsync();

        this.xrSession = undefined;
        this.modelPlaced = true;
        this.reset2D();
      } else {
        if (this.model && this.scene && this.placementIndicator) {
          const xr = await this.scene.createDefaultXRExperienceAsync({ disableDefaultUI: true, disableTeleportation: true });
          // Set up the hit test.
          const xrHitTestModule = xr.baseExperience.featuresManager.enableFeature(
            BABYLON.WebXRFeatureName.HIT_TEST,
            "latest",
             {offsetRay: {origin: {x: 0, y: 0, z: 0}, direction: {x: 0, y: 0, z: -1}}}) as BABYLON.WebXRHitTest;

          // Do some plane shtuff.
          const xrPlanes = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.PLANE_DETECTION, "latest") as BABYLON.WebXRPlaneDetector;
          console.log("Enabled plane detection.");
          const planes: any[] = [];

          xrPlanes.onPlaneAddedObservable.add(webXRPlane => {
            if (this.scene) {
              let plane : any = webXRPlane;
              webXRPlane.polygonDefinition.push(webXRPlane.polygonDefinition[0]);
              try {
                plane.mesh = BABYLON.MeshBuilder.CreatePolygon("plane", { shape : plane.polygonDefinition }, this.scene, this.earcut);
                planes[plane.id] = (plane.mesh);
                plane.mesh.material = this.planeMat;

                plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
                plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
              }
              catch (ex)
              {
                console.error(ex);
              }
            }
          });

          xrPlanes.onPlaneUpdatedObservable.add(webXRPlane => {
            let plane : any = webXRPlane;
              if (plane.mesh) {
                  plane.mesh.dispose(false, false);
              }

              const some = plane.polygonDefinition.some((p: any) => !p);
              if (some) {
                  return;
              }

              plane.polygonDefinition.push(plane.polygonDefinition[0]);
              try {
                plane.mesh = BABYLON.MeshBuilder.CreatePolygon("plane", { shape : plane.polygonDefinition }, this.scene, this.earcut);
                planes[plane.id] = (plane.mesh);
                plane.mesh.material = this.planeMat;
                plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
                plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
                plane.mesh.receiveShadows = true;
              }
              catch (ex)
              {
                console.error(ex);
              }
          });

          xrPlanes.onPlaneRemovedObservable.add(webXRPlane => {
            console.log("Plane removed.");
            let plane : any = webXRPlane;
              if (plane && planes[plane.id]) {
                  planes[plane.id].dispose();
              }
          });

          xrHitTestModule.onHitTestResultObservable.add((results) => {
            if (results.length) {
              if (!this.modelPlaced) {
                this.placementIndicator?.setEnabled(true);
              }
              else {
                this.placementIndicator?.setEnabled(false);
              }

              if (this.placementIndicator) {
                this.placementIndicator.position = results[0].position;
              }
            }
          });

          const session = await xr.baseExperience.enterXRAsync("immersive-ar", "unbounded", xr.renderTarget);
          this.model.setEnabled(false);
          this.modelPlaced = false;
          this.xrSession = session;
          this.model.rotate(BABYLON.Vector3.Up(), 3.14159);
        }
      }
    }
}

// Uncomment these lines in the Babylon.js Playground
/*
class Playground {
    public static async CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): Promise<BABYLON.Scene> {
        var sampleScene = new SampleScene(engine);
        await sampleScene.initializeSceneAsync();
        try {
            await sampleScene.onToggleXr();
        }
        catch (e)
        {
            console.error(e);
        }
        var numInputs = 0;
        sampleScene.scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
                numInputs++;
                if (sampleScene.placementIndicator.isEnabled()) {
                    sampleScene.placeModel();
                }
                else if (numInputs == 2) {
                    sampleScene.resetClick();
                }
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                numInputs--;
                break;
        }
    });
    return sampleScene.scene;
    }
}*/