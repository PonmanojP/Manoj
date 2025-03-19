import React, { useState } from 'react';

function VoiceCommand() {
  const [response, setResponse] = useState('');

  const commands = {
    'turn on the fan': {
      action: 'turned_on',
      device: 'Alexa',
      appliance: 'Fan',
      response: 'Fan has been turned on successfully.',
    },
    'turn off the fan': {
      action: 'turned_off',
      device: 'Alexa',
      appliance: 'Fan',
      response: 'Fan has been turned off successfully.',
    },
    'get me the weather': {
      action: 'gathered_weather',
      device: 'Alexa',
      appliance: 'WeatherService',
      response: 'The current weather is sunny and 25°C.',
    },
  };

  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      if (commands[transcript]) {
        const { action, device, appliance, response } = commands[transcript];
        const batteryCharge = Math.floor(Math.random() * 100);
        await fetch('http://localhost:3000/log-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, device, appliance, batteryCharge, user: 'JohnDoe', activeDevices: 5, status: 'success' }),
        });
        setResponse(response);
      } else {
        setResponse('Sorry, I did not understand that command.');
      }
    };

    recognition.onerror = () => {
      setResponse('There was an error processing your voice command.');
    };
  };

  return (
    <div>
      <h2>Voice Command Interface</h2>
      <button onClick={startVoiceRecognition}>Start Voice Recognition</button>
      <p>{response}</p>
    </div>
  );
}

export default VoiceCommand;