import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExerciseAnimationType } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  Maximize2,
  Compass
} from 'lucide-react';

interface Instructor3DProps {
  animationType: ExerciseAnimationType;
  exerciseName: string;
  jointSafetyTip: string;
}

export const Instructor3D: React.FC<Instructor3DProps> = ({
  animationType,
  exerciseName,
  jointSafetyTip,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [cameraView, setCameraView] = useState<'free' | 'lateral' | 'frontal'>('lateral');
  const [currentKneeAngle, setCurrentKneeAngle] = useState(85);

  // References to preserve state in animation loop
  const animRef = useRef({
    isPlaying: true,
    speed: 1.0,
    animationType,
  });

  useEffect(() => {
    animRef.current.isPlaying = isPlaying;
    animRef.current.speed = speed;
    animRef.current.animationType = animationType;
  }, [isPlaying, speed, animationType]);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 320;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b); // Zinc-950

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.4, 2.8);
    camera.lookAt(0, 0.9, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.8); // Emerald key light
    dirLight.position.set(3, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8); // Cyan rim light
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // FLOOR (Tactical Football Pitch Lines)
    const floorGeo = new THREE.PlaneGeometry(6, 6);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121417,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pitch Grid lines
    const gridHelper = new THREE.GridHelper(6, 12, 0x10b981, 0x27272a);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // MATERIALS FOR ATHLETE
    const athleteMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7, // Zinc 200 athletic skin/suit
      roughness: 0.4,
      metalness: 0.1,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald glow on key joints
      emissive: 0x10b981,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark athletic jersey
      roughness: 0.5,
    });
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    // BUILD ARTICULATED HUMANOID RIG
    const athleteGroup = new THREE.Group();
    scene.add(athleteGroup);

    // Root Pelvis Node
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.95, 0);
    athleteGroup.add(pelvis);

    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.12, 16), torsoMat);
    pelvis.add(pelvisMesh);

    // Spine & Torso
    const torso = new THREE.Group();
    torso.position.set(0, 0.15, 0);
    pelvis.add(torso);

    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.38, 16), torsoMat);
    torsoMesh.position.y = 0.19;
    torso.add(torsoMesh);

    // Chest & Head
    const chestJoint = new THREE.Group();
    chestJoint.position.set(0, 0.38, 0);
    torso.add(chestJoint);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), athleteMat);
    headMesh.position.set(0, 0.2, 0);
    chestJoint.add(headMesh);

    // Arms: Left & Right
    const leftArm = new THREE.Group();
    leftArm.position.set(0.23, 0.34, 0);
    torso.add(leftArm);
    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.26, 12), athleteMat);
    leftArmMesh.position.y = -0.13;
    leftArm.add(leftArmMesh);

    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.26, 0);
    leftArm.add(leftForearm);
    const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.24, 12), athleteMat);
    leftForearmMesh.position.y = -0.12;
    leftForearm.add(leftForearmMesh);

    const rightArm = new THREE.Group();
    rightArm.position.set(-0.23, 0.34, 0);
    torso.add(rightArm);
    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.26, 12), athleteMat);
    rightArmMesh.position.y = -0.13;
    rightArm.add(rightArmMesh);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.26, 0);
    rightArm.add(rightForearm);
    const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.24, 12), athleteMat);
    rightForearmMesh.position.y = -0.12;
    rightForearm.add(rightForearmMesh);

    // Legs: Left & Right
    const leftThigh = new THREE.Group();
    leftThigh.position.set(0.12, -0.06, 0);
    pelvis.add(leftThigh);
    const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 14), athleteMat);
    leftThighMesh.position.y = -0.21;
    leftThigh.add(leftThighMesh);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.42, 0);
    leftThigh.add(leftKnee);
    const leftKneeMarker = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), jointMat);
    leftKnee.add(leftKneeMarker);

    const leftShin = new THREE.Group();
    leftKnee.add(leftShin);
    const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.44, 12), athleteMat);
    leftShinMesh.position.y = -0.22;
    leftShin.add(leftShinMesh);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), jointMat);
    leftFoot.position.set(0, -0.44, 0.06);
    leftShin.add(leftFoot);

    // Right Leg
    const rightThigh = new THREE.Group();
    rightThigh.position.set(-0.12, -0.06, 0);
    pelvis.add(rightThigh);
    const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 14), athleteMat);
    rightThighMesh.position.y = -0.21;
    rightThigh.add(rightThighMesh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.42, 0);
    rightThigh.add(rightKnee);
    const rightKneeMarker = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), jointMat);
    rightKnee.add(rightKneeMarker);

    const rightShin = new THREE.Group();
    rightKnee.add(rightShin);
    const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.44, 12), athleteMat);
    rightShinMesh.position.y = -0.22;
    rightShin.add(rightShinMesh);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), jointMat);
    rightFoot.position.set(0, -0.44, 0.06);
    rightShin.add(rightFoot);

    // HOME PROPS (Spawned conditionally: Wall, Chair, Step)
    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.08), propMat);
    wallMesh.position.set(0, 1.1, -0.22);
    scene.add(wallMesh);

    const chairGroup = new THREE.Group();
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.44), propMat);
    chairSeat.position.y = 0.45;
    chairGroup.add(chairSeat);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.45, 0.04), propMat);
    chairBack.position.set(0, 0.68, -0.2);
    chairGroup.add(chairBack);
    chairGroup.position.set(0, 0, -0.15);
    scene.add(chairGroup);

    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.45), propMat);
    stepMesh.position.set(0, 0.09, 0.2);
    scene.add(stepMesh);

    // MOUSE & TOUCH ORBIT CONTROLS
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 4;
    let sphericalPhi = Math.PI / 3;
    let sphericalRadius = 3.6;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      sphericalTheta -= deltaX * 0.01;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.01));
      updateCameraPos();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRadius = Math.max(1.8, Math.min(5.5, sphericalRadius + e.deltaY * 0.003));
      updateCameraPos();
    };

    function updateCameraPos() {
      camera.position.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = sphericalRadius * Math.cos(sphericalPhi);
      camera.position.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.85, 0);
    }

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    container.addEventListener('wheel', onWheel, { passive: false });

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let animTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (animRef.current.isPlaying) {
        animTime += delta * animRef.current.speed;
      }

      const type = animRef.current.animationType;

      // Visibility of home props
      wallMesh.visible = type === 'wall_sit' || type === 'tibialis_raise' || type === 'legs_up_wall' || type === 'hip_mobility';
      chairGroup.visible = type === 'chair_squat' || type === 'plank';
      stepMesh.visible = type === 'step_up' || type === 'calf_raise';

      // RESET ROTATIONS
      athleteGroup.position.set(0, 0, 0);
      athleteGroup.rotation.set(0, 0, 0);
      pelvis.position.set(0, 0.95, 0);
      pelvis.rotation.set(0, 0, 0);
      torso.rotation.set(0, 0, 0);
      leftThigh.rotation.set(0, 0, 0);
      rightThigh.rotation.set(0, 0, 0);
      leftKnee.rotation.set(0, 0, 0);
      rightKnee.rotation.set(0, 0, 0);
      leftArm.rotation.set(0, 0, 0);
      rightArm.rotation.set(0, 0, 0);
      leftForearm.rotation.set(0, 0, 0);
      rightForearm.rotation.set(0, 0, 0);

      // --- PROCEDURAL ANIMATIONS ---
      if (type === 'wall_sit') {
        // Wall Sit: athlete against wall, thighs at 85º, steady breath
        pelvis.position.set(0, 0.62, -0.06);
        athleteGroup.rotation.y = 0;
        torso.rotation.x = -0.05; // Leaning on wall

        // Thighs horizontal
        leftThigh.rotation.x = -1.45;
        rightThigh.rotation.x = -1.45;
        // Knees at 90 deg
        leftKnee.rotation.x = 1.48;
        rightKnee.rotation.x = 1.48;

        // Arms folded or forward
        leftArm.rotation.x = -0.6;
        rightArm.rotation.x = -0.6;
        leftForearm.rotation.x = -0.5;
        rightForearm.rotation.x = -0.5;

        // Subtle breathing
        const breath = Math.sin(animTime * 2.5) * 0.02;
        torso.position.y = 0.15 + breath;
        setCurrentKneeAngle(85);

      } else if (type === 'chair_squat') {
        // Chair Squat: Hip hinge, descend to chair touch, rise
        const cycle = (Math.sin(animTime * 1.8) + 1) / 2; // 0 to 1
        // cycle = 0: standing, 1: seated
        pelvis.position.y = 0.95 - cycle * 0.44;
        pelvis.position.z = -cycle * 0.22;
        torso.rotation.x = cycle * 0.35; // Torso angle to balance

        leftThigh.rotation.x = -cycle * 1.45;
        rightThigh.rotation.x = -cycle * 1.45;
        leftKnee.rotation.x = cycle * 1.5;
        rightKnee.rotation.x = cycle * 1.5;

        // Arms forward for counter-balance
        leftArm.rotation.x = -cycle * 1.3;
        rightArm.rotation.x = -cycle * 1.3;

        setCurrentKneeAngle(Math.round(180 - cycle * 95));

      } else if (type === 'glute_bridge') {
        // Lying on floor, hips thrusting upwards
        athleteGroup.position.set(0, 0.08, 0);
        athleteGroup.rotation.x = -Math.PI / 2; // Lie flat

        const thrust = (Math.sin(animTime * 2.0) + 1) / 2;
        pelvis.position.z = thrust * 0.32; // Elevation of pelvis

        leftThigh.rotation.x = 1.3 - thrust * 0.4;
        rightThigh.rotation.x = 1.3 - thrust * 0.4;
        leftKnee.rotation.x = -1.4 + thrust * 0.3;
        rightKnee.rotation.x = -1.4 + thrust * 0.3;

        setCurrentKneeAngle(Math.round(90 + thrust * 30));

      } else if (type === 'calf_raise') {
        // Standing on step, rising on tiptoes and dropping
        const lift = (Math.sin(animTime * 2.2) + 1) / 2;
        pelvis.position.y = 0.95 + lift * 0.14;
        pelvis.position.z = 0.2;

        leftThigh.rotation.x = -0.05;
        rightThigh.rotation.x = -0.05;
        leftKnee.rotation.x = 0.05;
        rightKnee.rotation.x = 0.05;

        // Ankle extension
        leftFoot.rotation.x = lift * 0.5 - 0.2;
        rightFoot.rotation.x = lift * 0.5 - 0.2;

        setCurrentKneeAngle(175);

      } else if (type === 'bird_dog') {
        // Quadruped on floor, alternating arm & leg
        athleteGroup.position.set(0, 0.28, 0);
        torso.rotation.x = Math.PI / 2 - 0.1;
        pelvis.position.y = 0.45;

        const cycle = Math.sin(animTime * 1.8);
        if (cycle >= 0) {
          // Right arm + Left leg
          rightArm.rotation.x = -cycle * 1.2;
          leftThigh.rotation.x = -cycle * 1.2;
          leftArm.rotation.x = 0;
          rightThigh.rotation.x = 1.4;
          rightKnee.rotation.x = 1.4;
        } else {
          // Left arm + Right leg
          const c = Math.abs(cycle);
          leftArm.rotation.x = -c * 1.2;
          rightThigh.rotation.x = -c * 1.2;
          rightArm.rotation.x = 0;
          leftThigh.rotation.x = 1.4;
          leftKnee.rotation.x = 1.4;
        }
        setCurrentKneeAngle(170);

      } else if (type === 'plank') {
        // Straight plank prone
        athleteGroup.position.set(0, 0.3, 0);
        athleteGroup.rotation.x = Math.PI / 2;
        torso.rotation.x = 0;
        leftArm.rotation.x = 0.3;
        rightArm.rotation.x = 0.3;
        leftForearm.rotation.x = -0.8;
        rightForearm.rotation.x = -0.8;
        leftThigh.rotation.x = 0;
        rightThigh.rotation.x = 0;
        setCurrentKneeAngle(180);

      } else if (type === 'futsal_footwork') {
        // Low defensive shuffle (side to side)
        const lateral = Math.sin(animTime * 2.8) * 0.45;
        athleteGroup.position.x = lateral;
        pelvis.position.y = 0.78; // Low stance

        leftThigh.rotation.x = -0.7;
        rightThigh.rotation.x = -0.7;
        leftKnee.rotation.x = 0.8;
        rightKnee.rotation.x = 0.8;

        // Wide arms for defensive blocking
        leftArm.rotation.z = 0.9;
        rightArm.rotation.z = -0.9;
        leftArm.rotation.x = -0.3;
        rightArm.rotation.x = -0.3;

        setCurrentKneeAngle(130);

      } else if (type === 'step_up') {
        // Step onto platform
        const cycle = (Math.sin(animTime * 2.0) + 1) / 2;
        pelvis.position.y = 0.95 + cycle * 0.2;
        pelvis.position.z = cycle * 0.15;

        leftThigh.rotation.x = -cycle * 1.1;
        leftKnee.rotation.x = cycle * 1.1;
        rightThigh.rotation.x = cycle * 0.3;
        rightKnee.rotation.x = cycle * 0.3;

        setCurrentKneeAngle(Math.round(180 - cycle * 80));

      } else if (type === 'tibialis_raise') {
        // Standing back against wall, flexing feet up
        pelvis.position.set(0, 0.95, -0.05);
        const flex = (Math.sin(animTime * 2.2) + 1) / 2;
        leftFoot.rotation.x = -flex * 0.55;
        rightFoot.rotation.x = -flex * 0.55;
        setCurrentKneeAngle(178);

      } else if (type === 'legs_up_wall') {
        // Lying on floor, legs vertical against wall
        athleteGroup.position.set(0, 0.08, -0.05);
        athleteGroup.rotation.x = -Math.PI / 2;
        leftThigh.rotation.x = 1.55;
        rightThigh.rotation.x = 1.55;
        leftKnee.rotation.x = 0;
        rightKnee.rotation.x = 0;
        setCurrentKneeAngle(180);

      } else {
        // Default Hip Mobility Swings
        const swing = Math.sin(animTime * 2.5) * 0.6;
        rightThigh.rotation.x = swing;
        rightKnee.rotation.x = Math.max(0, swing * 0.8);
        leftArm.rotation.x = -swing * 0.5;
        setCurrentKneeAngle(150);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight || 320;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [animationType]);

  // Camera View Change Handlers
  const setView = (view: 'free' | 'lateral' | 'frontal') => {
    setCameraView(view);
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    if (view === 'lateral') {
      camera.position.set(3.4, 0.9, 0);
    } else if (view === 'frontal') {
      camera.position.set(0, 0.9, 3.4);
    } else {
      camera.position.set(2.8, 1.4, 2.8);
    }
    camera.lookAt(0, 0.85, 0);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* 3D Canvas Header with HUD status */}
      <div className="p-2.5 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            3D
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Instructor 3D</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                EN VIVO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-[170px] sm:max-w-xs">
              {exerciseName}
            </p>
          </div>
        </div>

        {/* Dynamic Joint Angle HUD (Vital for 120kg joint safety) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-zinc-800 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase font-bold hidden sm:block">Ángulo Rodilla</div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
              {currentKneeAngle}º <span className="text-[9px] text-zinc-400 font-normal">Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Area with touch-none for mobile swipe */}
      <div className="relative w-full h-[220px] sm:h-[320px] bg-zinc-950 cursor-grab active:cursor-grabbing select-none touch-none">
        <div ref={mountRef} className="w-full h-full touch-none" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setView('lateral')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              cameraView === 'lateral'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Vista de Perfil (Recomendada para vigilar el ángulo de la rótula)"
          >
            Perfil
          </button>
          <button
            onClick={() => setView('frontal')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              cameraView === 'frontal'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Vista Frontal (Para vigilar que las rodillas no se cierren hacia adentro)"
          >
            Frontal
          </button>
          <button
            onClick={() => setView('free')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              cameraView === 'free'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Perspectiva 3D Libre"
          >
            3D Libre
          </button>
        </div>

        {/* Orbit Drag Notice */}
        <div className="absolute bottom-3 left-3 bg-zinc-900/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-zinc-800/80 text-[10px] text-zinc-400 flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>Arrastra con el ratón o dedo para girar 360º</span>
        </div>

        {/* Play/Pause & Speed Buttons (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 text-zinc-300 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </button>

          <div className="flex items-center text-[10px] font-mono text-zinc-400 px-1 border-l border-zinc-800">
            {[0.5, 1.0, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded ${
                  speed === s ? 'bg-zinc-800 text-emerald-400 font-bold' : 'hover:text-zinc-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Biomechanical Joint Guidance Callout below canvas */}
      <div className="p-3 bg-zinc-900/90 border-t border-zinc-800/80 text-xs flex items-center gap-2.5">
        <div className="h-6 w-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="text-zinc-300 text-[11px] leading-tight">
          <strong className="text-emerald-400 font-semibold">Técnica para 120kg:</strong> {jointSafetyTip}
        </p>
      </div>
    </div>
  );
};
