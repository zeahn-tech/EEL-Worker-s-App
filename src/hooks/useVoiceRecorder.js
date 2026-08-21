import { useState, useRef, useCallback } from 'react';

const MAX_DURATION_SECONDS = 120; // cap recordings so local storage doesn't balloon

// Converts a recorded audio Blob into a base64 data URL, the same storage pattern
// already used for files/images in this app (see ImagePickerModal / FilePickerModal).
const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Could not process the recording.'));
  reader.readAsDataURL(blob);
});

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const elapsedSecondsRef = useRef(0);
  const resolveRef = useRef(null); // resolves the promise returned by stopRecording

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }
      resolveRef.current = resolve;
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    });
  }, []);

  const startRecording = useCallback(async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupStream();
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const audioUrl = await blobToDataUrl(blob);
          resolveRef.current?.({ audioUrl, duration: elapsedSecondsRef.current });
        } catch (err) {
          resolveRef.current?.(null);
        }
      };

      recorder.start();
      setIsRecording(true);
      setElapsedSeconds(0);
      elapsedSecondsRef.current = 0;
      timerRef.current = setInterval(() => {
        elapsedSecondsRef.current += 1;
        setElapsedSeconds(elapsedSecondsRef.current);
        if (elapsedSecondsRef.current >= MAX_DURATION_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      setError(err.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow it in your browser settings to record a voice note.'
        : 'Could not access the microphone.');
    }
  }, [stopRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      resolveRef.current = null;
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
    setIsRecording(false);
    setElapsedSeconds(0);
  }, []);

  return { isRecording, elapsedSeconds, error, startRecording, stopRecording, cancelRecording };
};
